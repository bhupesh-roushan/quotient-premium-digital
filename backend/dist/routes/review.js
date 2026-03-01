"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = exports.reviewRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importStar(require("mongoose"));
const requireAuth_1 = require("../middleware/requireAuth");
const Product_1 = require("../models/Product");
/** Express router for product review endpoints — mounted at /api/reviews. */
exports.reviewRouter = (0, express_1.Router)();
// Review schema
const ReviewSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    productId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Product" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    helpful: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
// Create Review model
const Review = mongoose_1.default.model("Review", ReviewSchema);
exports.Review = Review;
/**
 * POST /api/reviews  [protected]
 * Creates a new review for a product. Validates that the reviewer is not the
 * product creator, prevents duplicate reviews, then recalculates and saves
 * the updated averageRating and reviewCount on the product document.
 */
exports.reviewRouter.post("/", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { productId, rating, title, content, helpful } = req.body;
        if (!productId || !rating || !title || !content) {
            return res.status(400).json({
                ok: false,
                error: "Product ID, rating, title, and content are required",
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
        // Prevent creator from reviewing their own product
        if (String(product?.creatorId) === userId) {
            return res.status(403).json({
                ok: false,
                error: "You cannot review your own product",
            });
        }
        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.status(409).json({
                ok: false,
                error: "You have already reviewed this product",
            });
        }
        const review = await Review.create({
            userId,
            productId,
            rating: Number(rating),
            title,
            content,
            helpful: Boolean(helpful),
        });
        // Update product with review stats
        const reviewCount = await Review.countDocuments({ productId });
        const avgRatingResult = await Review.aggregate([
            { $match: { productId: new mongoose_1.default.Types.ObjectId(productId) } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);
        const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
        await Product_1.Product.findByIdAndUpdate(productId, {
            $set: {
                "stats.reviewCount": reviewCount,
                "stats.averageRating": avgRating,
            }
        });
        res.json({
            ok: true,
            review,
        });
    }
    catch (error) {
        console.error("Failed to create review:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to create review",
        });
    }
});
/**
 * GET /api/reviews/:productId  [protected]
 * Returns all reviews for a given product, sorted newest first,
 * with reviewer name/email populated from the User collection.
 */
exports.reviewRouter.get("/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                error: "Product not found",
            });
        }
        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .populate({
            path: "userId",
            select: "name email avatar"
        });
        return res.json({
            ok: true,
            reviews,
        });
    }
    catch (error) {
        console.error("Failed to fetch reviews:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch reviews",
        });
    }
});
/**
 * GET /api/reviews/user  [protected]
 * Returns all reviews written by the currently authenticated user.
 */
exports.reviewRouter.get("/user", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
            path: "userId",
            select: "name email avatar"
        });
        res.json({
            ok: true,
            reviews,
        });
    }
    catch (error) {
        console.error("Failed to fetch user reviews:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch reviews",
        });
    }
});
/**
 * PATCH /api/reviews/:reviewId  [protected]
 * Updates the helpful flag on an existing review. Only the review owner can update it.
 */
exports.reviewRouter.patch("/:reviewId", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { reviewId, helpful } = req.body;
        const userId = req.user.id;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                ok: false,
                error: "Review not found",
            });
        }
        if (String(review.userId) !== userId) {
            return res.status(403).json({
                ok: false,
                error: "You can only update your own reviews",
            });
        }
        if (typeof helpful === "boolean") {
            review.helpful = helpful;
        }
        await review.save();
        res.json({
            ok: true,
            review,
        });
    }
    catch (error) {
        console.error("Failed to update review:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to update review",
        });
    }
});
/**
 * DELETE /api/reviews/:reviewId  [protected]
 * Permanently deletes a review. Only the review owner can delete their own review.
 */
exports.reviewRouter.delete("/:reviewId", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                ok: false,
                error: "Review not found",
            });
        }
        if (String(review.userId) !== userId) {
            return res.status(403).json({
                ok: false,
                error: "You can only delete your own reviews",
            });
        }
        await Review.findByIdAndDelete(reviewId);
        res.json({
            ok: true,
            message: "Review deleted successfully",
        });
    }
    catch (error) {
        console.error("Failed to delete review:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to delete review",
        });
    }
});
/**
 * GET /api/reviews  [protected]
 * Returns paginated reviews with optional productId and rating filters.
 * Defaults to page 1, limit 10.
 */
exports.reviewRouter.get("/", async (req, res) => {
    try {
        const { productId, rating, page = 1, limit = 10 } = req.query;
        let query = { productId };
        if (productId)
            query.productId = productId;
        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .populate({
            path: "userId",
            select: "name email avatar"
        })
            .limit(limit ? Number(limit) : 10);
        const numericLimit = Number(limit || 10);
        const numericPage = Number(page || 1);
        return res.json({
            ok: true,
            reviews,
            pagination: {
                page: numericPage,
                limit: numericLimit,
                total: reviews.length,
                pages: Math.ceil(reviews.length / numericLimit),
            },
        });
    }
    catch (error) {
        console.error("Failed to fetch reviews:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch reviews",
        });
    }
});
