"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorSalesSimpleRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const requireAuth_1 = require("../middleware/requireAuth");
exports.creatorSalesSimpleRouter = (0, express_1.Router)();
// Add authentication middleware
exports.creatorSalesSimpleRouter.use(requireAuth_1.requireAuth);
// Simple sales endpoint with authentication but allow any seller
exports.creatorSalesSimpleRouter.get("/", async (req, res) => {
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
        const sellerId = new mongoose_1.Types.ObjectId(req.user.id);
        // Get sales only for this seller (creator or buyer)
        const sales = await Order_1.Order.aggregate([
            { $match: { status: "paid" } },
            {
                $lookup: {
                    from: Product_1.Product.collection.name,
                    localField: "productId",
                    foreignField: "_id",
                    as: "p",
                },
            },
            { $unwind: "$p" },
            { $match: { "p.creatorId": sellerId } },
            {
                $lookup: {
                    from: User_1.User.collection.name,
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
    }
    catch (err) {
        console.error("Simple sales API error:", err);
        return res.status(500).json({
            ok: false,
            error: "Failed to fetch sales data",
        });
    }
});
