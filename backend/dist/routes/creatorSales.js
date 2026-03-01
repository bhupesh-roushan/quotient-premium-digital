"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorSalesRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const mongoose_1 = require("mongoose");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
exports.creatorSalesRouter = (0, express_1.Router)();
exports.creatorSalesRouter.use(requireAuth_1.requireAuth);
exports.creatorSalesRouter.get("/", async (req, res) => {
    try {
        console.log("Sales API - User authenticated:", !!req.user);
        console.log("Sales API - User details:", {
            id: req.user?.id,
            email: req.user?.email,
            isCreator: req.user?.isCreator
        });
        if (!req.user.isCreator) {
            console.log("Sales API - Access denied: User is not a creator");
            return res.status(403).json({ ok: false, error: "Creator only" });
        }
        console.log("Sales API - Access granted: User is creator");
        const creatorId = new mongoose_1.Types.ObjectId(req.user.id);
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
            {
                $unwind: "$p",
            },
            {
                $match: { "p.creatorId": creatorId },
            },
            {
                $lookup: {
                    from: User_1.User.collection.name,
                    localField: "buyerId",
                    foreignField: "_id",
                    as: "b",
                },
            },
            {
                $unwind: { path: "$b", preserveNullAndEmptyArrays: true },
            },
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
            {
                $sort: { paidAt: -1, _id: -1 },
            },
            {
                $limit: 100,
            },
        ]);
        return res.json({ ok: true, sales });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
