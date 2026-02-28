import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";
import z from "zod";
import { Product } from "../models/Product";
import { razorpay, toSubunits } from "../lib/razorpay";
import { Order } from "../models/Order";
import crypto from "crypto";

export const checkoutRouter = Router();

checkoutRouter.use(requireAuth);

const CreateSessionSchema = z.object({
  productId: z.string().min(1),
});

checkoutRouter.post("/create-session", async (req: AuthedRequest, res) => {
  try {
    const { productId } = CreateSessionSchema.parse(req.body);

    const product = await Product.findById(productId).lean();

    if (!product || product.visibility !== "published") {
      return res.status(404).json({
        ok: false,
        error: "Product not found!",
      });
    }

    const currency = product.currency;

    const createRazorpayOrder = await razorpay.orders.create({
      amount: toSubunits(product.price),
      currency,
      receipt: `prod_${product._id.toString()}`,
    });

    const createDBOrder = await Order.create({
      buyerId: req.user!.id,
      productId: product._id,
      amount: product.price,
      currency,
      status: "pending",
      paidAt: null,
      provider: "razorpay",
      providerOrderId: createRazorpayOrder.id,
      providerPaymentId: undefined,
    });

    return res.json({
      ok: true,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: createRazorpayOrder.id,
        amount: createRazorpayOrder.amount,
        currency: createRazorpayOrder.currency,
      },
      order: {
        id: createDBOrder._id.toString(),
        productId: product._id.toString(),
        title: product.title,
        description: product.description,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});

const ConfirmSchema = z.object({
  orderId: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

checkoutRouter.post("/confirm", async (req: AuthedRequest, res) => {
  try {
    const body = ConfirmSchema.parse(req.body);

    const order = await Order.findOne({
      _id: body.orderId,
      buyerId: req.user!.id,
    }).lean();

    if (!order) {
      return res.status(400).json({
        ok: false,
        error: "Order not found",
      });
    }

    if (order.status === "paid") return res.json({ ok: true });

    if (order.providerOrderId !== body.razorpay_order_id) {
      return res.status(400).json({
        ok: false,
        error: "Order ID mismatch",
      });
    }

    // order_id|payment_id

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex");

    if (generated !== body.razorpay_signature) {
      return res.status(400).json({
        ok: false,
        error: "Invalid signature",
      });
    }

    const now = new Date();

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        buyerId: req.user!.id,
        status: "pending",
      },
      {
        $set: {
          status: "paid",
          paidAt: now,
          providerPaymentId: body.razorpay_payment_id,
        },
      },
      {
        new: true,
      }
    ).lean();

    if (updated) {
      await Product.updateOne(
        {
          _id: updated.productId,
        },
        {
          $inc: { "stats.soldCount": 1 },
        }
      );
    }

    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});
