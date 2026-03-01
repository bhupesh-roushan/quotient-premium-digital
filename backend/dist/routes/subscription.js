"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../models/Product");
exports.subscriptionRouter = (0, express_1.Router)();
exports.subscriptionRouter.use(requireAuth_1.requireAuth);
// Create subscription
exports.subscriptionRouter.post("/", async (req, res) => {
    try {
        const { productId, planType, autoRenew } = req.body;
        if (!productId || !planType) {
            return res.status(400).json({
                ok: false,
                error: "Product ID and plan type are required",
            });
        }
        const userId = req.user.id;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        // Get pricing based on plan type
        let price = 0;
        let currency = "INR";
        if (planType === "monthly") {
            price = product.price * 0.9; // 10% discount for monthly
        }
        else if (planType === "yearly") {
            price = product.price * 8; // 2 months free for yearly
        }
        else if (planType === "lifetime") {
            price = product.price * 10; // Lifetime price (10x monthly)
        }
        const subscription = {
            userId,
            productId,
            planType,
            status: "active",
            startDate: new Date().toISOString(),
            price,
            currency,
            features: ["Access to product", "Priority support", "Regular updates"],
            autoRenew: Boolean(autoRenew),
        };
        // In a real implementation, this would integrate with payment provider
        // For now, we'll create the subscription record
        res.json({
            ok: true,
            subscription,
            message: "Subscription created successfully",
        });
    }
    catch (error) {
        console.error("Failed to create subscription:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to create subscription",
        });
    }
});
// Get user subscriptions
exports.subscriptionRouter.get("/user", async (req, res) => {
    try {
        const userId = req.user.id;
        const subscriptions = await Product_1.Product.find({
            userId,
            subscriptions: { $exists: true, $ne: null }
        }).populate({
            path: "productId",
            select: "title description price currency"
        });
        res.json({
            ok: true,
            subscriptions,
        });
    }
    catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch subscriptions",
        });
    }
});
// Cancel subscription
exports.subscriptionRouter.patch("/:subscriptionId/cancel", async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.id;
        const subscription = await Product_1.Product.findOne({
            _id: subscriptionId,
            "subscriptions._id": userId,
            "subscriptions.status": "active"
        });
        if (!subscription) {
            return res.status(404).json({
                ok: false,
                error: "Subscription not found",
            });
        }
        // Find the specific subscription and update it
        const subscriptionIndex = subscription.subscriptions?.findIndex((sub) => String(sub.userId) === userId && sub.status === "active") ?? -1;
        if (subscriptionIndex === -1) {
            return res.status(404).json({
                ok: false,
                error: "Active subscription not found",
            });
        }
        subscription.subscriptions[subscriptionIndex].status = "cancelled";
        subscription.subscriptions[subscriptionIndex].endDate = new Date().toISOString();
        await subscription.save();
        res.json({
            ok: true,
            message: "Subscription cancelled successfully",
        });
    }
    catch (error) {
        console.error("Failed to cancel subscription:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to cancel subscription",
        });
    }
});
// Create licensing tier
exports.subscriptionRouter.post("/licensing", async (req, res) => {
    try {
        const { productId, name, price, licenseType, features, limitations, duration, supportLevel } = req.body;
        if (!productId || !name || !price || !licenseType) {
            return res.status(400).json({
                ok: false,
                error: "Product ID, name, price, and license type are required",
            });
        }
        const userId = req.user.id;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        if (String(product?.creatorId) !== userId) {
            return res.status(403).json({
                ok: false,
                error: "You can only create licensing tiers for your own products",
            });
        }
        const licensingTier = {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            productId,
            name,
            price: Number(price),
            currency: "INR",
            licenseType,
            features: Array.isArray(features) ? features : [],
            limitations: Array.isArray(limitations) ? limitations : [],
            duration,
            supportLevel,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // Add licensing tier to product
        if (!product.licensingTiers) {
            product.licensingTiers = [];
        }
        product.licensingTiers.push(licensingTier);
        await product.save();
        res.json({
            ok: true,
            licensingTier,
            message: "Licensing tier created successfully",
        });
    }
    catch (error) {
        console.error("Failed to create licensing tier:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to create licensing tier",
        });
    }
});
// Get product licensing tiers
exports.subscriptionRouter.get("/licensing/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        res.json({
            ok: true,
            licensingTiers: product.licensingTiers || [],
        });
    }
    catch (error) {
        console.error("Failed to fetch licensing tiers:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch licensing tiers",
        });
    }
});
// Update licensing tier
exports.subscriptionRouter.patch("/licensing/:tierId", async (req, res) => {
    try {
        const { tierId } = req.params;
        const { name, price, licenseType, features, limitations, duration, supportLevel, isActive } = req.body;
        const userId = req.user.id;
        const product = await Product_1.Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        if (String(product?.creatorId) !== userId) {
            return res.status(403).json({
                ok: false,
                error: "You can only update licensing tiers for your own products",
            });
        }
        const licensingTiers = product.licensingTiers || [];
        const licensingTier = licensingTiers.find(tier => tier._id.toString() === tierId);
        if (!licensingTier) {
            return res.status(404).json({
                ok: false,
                error: "Licensing tier not found",
            });
        }
        // Update licensing tier
        if (name)
            licensingTier.name = name;
        if (price)
            licensingTier.price = Number(price);
        if (licenseType)
            licensingTier.licenseType = licenseType;
        if (Array.isArray(features))
            licensingTier.features = features;
        if (limitations)
            licensingTier.limitations = limitations;
        if (duration)
            licensingTier.duration = duration;
        if (supportLevel)
            licensingTier.supportLevel = supportLevel;
        if (typeof isActive === "boolean")
            licensingTier.isActive = isActive;
        await product.save();
        res.json({
            ok: true,
            licensingTier,
            message: "Licensing tier updated successfully",
        });
    }
    catch (error) {
        console.error("Failed to update licensing tier:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to update licensing tier",
        });
    }
});
// Delete licensing tier
exports.subscriptionRouter.delete("/licensing/:tierId", async (req, res) => {
    try {
        const { tierId } = req.params;
        const userId = req.user.id;
        const product = await Product_1.Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        if (String(product?.creatorId) !== userId) {
            return res.status(403).json({
                ok: false,
                error: "You can only delete licensing tiers for your own products",
            });
        }
        const licensingTiers = product.licensingTiers || [];
        const updatedTiers = licensingTiers.filter(tier => tier._id.toString() !== tierId);
        product.licensingTiers = updatedTiers;
        await product.save();
        res.json({
            ok: true,
            message: "Licensing tier deleted successfully",
        });
    }
    catch (error) {
        console.error("Failed to delete licensing tier:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to delete licensing tier",
        });
    }
});
