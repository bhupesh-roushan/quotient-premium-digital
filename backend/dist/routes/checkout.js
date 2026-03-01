"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const zod_1 = __importDefault(require("zod"));
const Product_1 = require("../models/Product");
const razorpay_1 = require("../lib/razorpay");
const Order_1 = require("../models/Order");
const crypto_1 = __importDefault(require("crypto"));
/** Express router for payment checkout endpoints — mounted at /api/checkout. All routes require auth. */
exports.checkoutRouter = (0, express_1.Router)();
exports.checkoutRouter.use(requireAuth_1.requireAuth);
const CreateSessionSchema = zod_1.default.object({
    productId: zod_1.default.string().min(1),
});
/**
 * POST /api/checkout/create-session  [protected]
 * Creates a Razorpay order for the given productId and a matching pending Order
 * document in MongoDB. Returns the Razorpay keyId, orderId, amount, and currency
 * needed by the frontend to open the Razorpay payment modal.
 */
exports.checkoutRouter.post("/create-session", async (req, res) => {
    try {
        const { productId } = CreateSessionSchema.parse(req.body);
        const product = await Product_1.Product.findById(productId).lean();
        if (!product || product.visibility !== "published") {
            return res.status(404).json({
                ok: false,
                error: "Product not found!",
            });
        }
        const currency = product.currency;
        const createRazorpayOrder = await razorpay_1.razorpay.orders.create({
            amount: (0, razorpay_1.toSubunits)(product.price),
            currency,
            receipt: `prod_${product._id.toString()}`,
        });
        const createDBOrder = await Order_1.Order.create({
            buyerId: req.user.id,
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
const ConfirmSchema = zod_1.default.object({
    orderId: zod_1.default.string().min(1),
    razorpay_payment_id: zod_1.default.string().min(1),
    razorpay_order_id: zod_1.default.string().min(1),
    razorpay_signature: zod_1.default.string().min(1),
});
/**
 * POST /api/checkout/confirm  [protected]
 * Verifies the Razorpay payment signature using HMAC-SHA256, marks the Order
 * as paid, and increments the product's soldCount stat.
 * Idempotent — returns ok:true immediately if the order is already paid.
 */
exports.checkoutRouter.post("/confirm", async (req, res) => {
    try {
        const body = ConfirmSchema.parse(req.body);
        const order = await Order_1.Order.findOne({
            _id: body.orderId,
            buyerId: req.user.id,
        }).lean();
        if (!order) {
            return res.status(400).json({
                ok: false,
                error: "Order not found",
            });
        }
        if (order.status === "paid")
            return res.json({ ok: true });
        if (order.providerOrderId !== body.razorpay_order_id) {
            return res.status(400).json({
                ok: false,
                error: "Order ID mismatch",
            });
        }
        // order_id|payment_id
        const generated = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
            .digest("hex");
        if (generated !== body.razorpay_signature) {
            return res.status(400).json({
                ok: false,
                error: "Invalid signature",
            });
        }
        const now = new Date();
        const updated = await Order_1.Order.findOneAndUpdate({
            _id: order._id,
            buyerId: req.user.id,
            status: "pending",
        }, {
            $set: {
                status: "paid",
                paidAt: now,
                providerPaymentId: body.razorpay_payment_id,
            },
        }, {
            new: true,
        }).lean();
        if (updated) {
            await Product_1.Product.updateOne({
                _id: updated.productId,
            }, {
                $inc: { "stats.soldCount": 1 },
            });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
