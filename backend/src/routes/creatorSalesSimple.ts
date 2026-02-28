import { Router } from "express";
import { Types } from "mongoose";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";

export const creatorSalesSimpleRouter = Router();

// Add authentication middleware
creatorSalesSimpleRouter.use(requireAuth);

// Simple sales endpoint with authentication but allow any seller
creatorSalesSimpleRouter.get("/", async (req: AuthedRequest, res) => {
  try {
    console.log("Simple sales API called - with authentication");
    console.log("User authenticated:", !!req.user);
    console.log("User details:", {
      id: req.user?.id,
      email: req.user?.email,
      isCreator: req.user?.isCreator
    });

    // Allow any authenticated user to see their sales (not just creators)
    if (!req.user) {
      console.log("Access denied: No user found");
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    console.log("Access granted: User is authenticated");
    const sellerId = new Types.ObjectId(req.user.id);

    // Get sales only for this seller (creator or buyer)
    const sales = await Order.aggregate([
      { $match: { status: "paid" } },
      {
        $lookup: {
          from: Product.collection.name,
          localField: "productId",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: "$p" },
      { $match: { "p.creatorId": sellerId } },
      {
        $lookup: {
          from: User.collection.name,
          localField: "buyerId",
          foreignField: "_id",
          as: "b",
        },
      },
      { $unwind: { path: "$b", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productTitle: "$p.title",
          amount: 1,
          currency: 1,
          paidAt: 1,
          buyerEmail: "$b.email",
          buyerName: "$b.name",
        },
      },
      { $sort: { paidAt: -1, _id: -1 } },
      { $limit: 100 },
    ]);

    console.log(`Found ${sales.length} sales records for seller ${req.user.email}`);

    return res.json({
      ok: true,
      sales,
    });
  } catch (err) {
    console.error("Simple sales API error:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch sales data",
    });
  }
});
