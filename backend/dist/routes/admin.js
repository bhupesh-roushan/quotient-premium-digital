"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const Order_1 = require("../models/Order");
exports.adminRouter = (0, express_1.Router)();
// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                ok: false,
                error: "Admin access required",
            });
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            error: "Failed to verify admin status",
        });
    }
};
exports.adminRouter.use(requireAuth_1.requireAuth);
exports.adminRouter.use(requireAdmin);
// Get dashboard statistics
exports.adminRouter.get("/stats", async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, totalRevenue, usersThisMonth, ordersThisMonth, revenueThisMonth,] = await Promise.all([
            User_1.User.countDocuments(),
            Product_1.Product.countDocuments(),
            Order_1.Order.countDocuments({ status: "paid" }),
            Order_1.Order.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            User_1.User.countDocuments({
                createdAt: { $gte: new Date(new Date().setDate(1)) },
            }),
            Order_1.Order.countDocuments({
                status: "paid",
                paidAt: { $gte: new Date(new Date().setDate(1)) },
            }),
            Order_1.Order.aggregate([
                {
                    $match: {
                        status: "paid",
                        paidAt: { $gte: new Date(new Date().setDate(1)) },
                    },
                },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);
        res.json({
            ok: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                usersThisMonth,
                ordersThisMonth,
                revenueThisMonth: revenueThisMonth[0]?.total || 0,
            },
        });
    }
    catch (error) {
        console.error("Failed to get admin stats:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get statistics",
        });
    }
});
// Get all users with pagination
exports.adminRouter.get("/users", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            };
        }
        const [users, total] = await Promise.all([
            User_1.User.find(query)
                .select("-passwordHash")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User_1.User.countDocuments(query),
        ]);
        res.json({
            ok: true,
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Failed to get users:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get users",
        });
    }
});
// Get all products with pagination
exports.adminRouter.get("/products", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const search = req.query.search;
        let query = {};
        if (status)
            query.visibility = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const [products, total] = await Promise.all([
            Product_1.Product.find(query)
                .populate("creatorId", "name email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product_1.Product.countDocuments(query),
        ]);
        res.json({
            ok: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Failed to get products:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get products",
        });
    }
});
// Get all orders with pagination
exports.adminRouter.get("/orders", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        let query = {};
        if (status)
            query.status = status;
        const [orders, total] = await Promise.all([
            Order_1.Order.find(query)
                .populate("buyerId", "name email")
                .populate("productId", "title")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Order_1.Order.countDocuments(query),
        ]);
        res.json({
            ok: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Failed to get orders:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get orders",
        });
    }
});
// Update user status (ban/unban)
exports.adminRouter.patch("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, isAdmin } = req.body;
        const updateData = {};
        if (typeof isActive !== "undefined")
            updateData.isActive = isActive;
        if (typeof isAdmin !== "undefined")
            updateData.isAdmin = isAdmin;
        const user = await User_1.User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select("-passwordHash");
        if (!user) {
            return res.status(404).json({
                ok: false,
                error: "User not found",
            });
        }
        res.json({
            ok: true,
            user,
            message: "User updated successfully",
        });
    }
    catch (error) {
        console.error("Failed to update user:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to update user",
        });
    }
});
// Delete product
exports.adminRouter.delete("/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        res.json({
            ok: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        console.error("Failed to delete product:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to delete product",
        });
    }
});
// Get revenue analytics
exports.adminRouter.get("/analytics/revenue", async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const revenueData = await Order_1.Order.aggregate([
            {
                $match: {
                    status: "paid",
                    paidAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                    },
                    revenue: { $sum: "$amount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({
            ok: true,
            data: revenueData,
        });
    }
    catch (error) {
        console.error("Failed to get revenue analytics:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get analytics",
        });
    }
});
// Get top creators
exports.adminRouter.get("/analytics/top-creators", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topCreators = await Order_1.Order.aggregate([
            { $match: { status: "paid" } },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.creatorId",
                    totalRevenue: { $sum: "$amount" },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: "$creator" },
            {
                $project: {
                    creatorId: "$_id",
                    creatorName: "$creator.name",
                    creatorEmail: "$creator.email",
                    totalRevenue: 1,
                    totalOrders: 1,
                },
            },
        ]);
        res.json({
            ok: true,
            creators: topCreators,
        });
    }
    catch (error) {
        console.error("Failed to get top creators:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to get analytics",
        });
    }
});
