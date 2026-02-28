import { Router } from "express";
import mongoose, { Schema, Types } from "mongoose";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";
import { Product } from "../models/Product";

// Review and Rating System
export const reviewRouter = Router();
reviewRouter.use(requireAuth);

// Review schema
const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  helpful: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create Review model
const Review = mongoose.model("Review", ReviewSchema);

export { Review };

export type Review = {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  helpful: Boolean;
  verified: Boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
};

// Create review
reviewRouter.post("/", async (req: AuthedRequest, res) => {
  try {
    const { productId, rating, title, content, helpful } = req.body;
    
    if (!productId || !rating || !title || !content) {
      return res.status(400).json({
        ok: false,
        error: "Product ID, rating, title, and content are required",
      });
    }

    const userId = req.user!.id;
    const product = await Product.findById(productId);
    
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
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        "stats.reviewCount": reviewCount,
        "stats.averageRating": avgRating,
      }
    });

    res.json({
      ok: true,
      review,
    });
  } catch (error) {
    console.error("Failed to create review:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create review",
    });
  }
});

// Get reviews for a product
reviewRouter.get("/:productId", async (req: AuthedRequest, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    
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
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch reviews",
    });
  }
});

// Get user's reviews
reviewRouter.get("/user", async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
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
  } catch (error) {
    console.error("Failed to fetch user reviews:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch reviews",
    });
  }
});

// Update review
reviewRouter.patch("/:reviewId", async (req: AuthedRequest, res) => {
  try {
    const { reviewId, helpful } = req.body;
    const userId = req.user!.id;
    
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
  } catch (error) {
    console.error("Failed to update review:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to update review",
    });
  }
});

// Delete review
reviewRouter.delete("/:reviewId", async (req: AuthedRequest, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.id;
    
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
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to delete review",
    });
  }
});

// Get reviews with pagination and filtering
reviewRouter.get("/", async (req: AuthedRequest, res) => {
  try {
    const { 
      productId, 
      rating, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query: any = { productId };
    
    if (productId) query.productId = productId;
    
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
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch reviews",
    });
  }
});
