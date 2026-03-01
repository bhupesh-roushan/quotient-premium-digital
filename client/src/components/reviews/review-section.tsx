"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "./review-card";
import { ReviewForm } from "./review-form";
import { StarRating, RatingSummary } from "./star-rating";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { MessageSquare, Star, ChevronDown, Filter } from "lucide-react";

interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  helpful: boolean;
  verified: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ReviewSectionProps {
  productId: string;
  userId?: string;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  isOwner?: boolean;
  averageRating: number;
  reviewCount: number;
}

/**
 * Full reviews section for a product detail page.
 * Renders a two-column layout: left column contains the rating summary and
 * write-review form; right column shows the filterable reviews list.
 * Fetches reviews from /api/reviews/:productId on mount and refreshes
 * the list after a new review is submitted.
 *
 * @param productId - MongoDB ID of the product
 * @param userId - ID of the current user (undefined if logged out)
 * @param isLoggedIn - Whether the user is authenticated
 * @param hasPurchased - Whether the user has purchased this product
 * @param isOwner - Whether the current user is the product creator
 * @param averageRating - Pre-computed average rating from product stats
 * @param reviewCount - Pre-computed review count from product stats
 */
export function ReviewSection({
  productId,
  userId,
  isLoggedIn,
  hasPurchased,
  isOwner = false,
  averageRating,
  reviewCount,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "verified" | number>("all");
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/reviews/${productId}`);
      if (res.data.ok) {
        setReviews(res.data.reviews || []);
        // Check if current user has already reviewed
        if (userId) {
          const userReview = res.data.reviews.find(
            (r: Review) => r.userId === userId
          );
          setHasReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, userId]);

  const handleSubmitReview = async (review: {
    rating: number;
    title: string;
    content: string;
  }) => {
    try {
      const res = await apiClient.post("/api/reviews", {
        productId,
        ...review,
        verified: hasPurchased,
      });

      if (res.data.ok) {
        await fetchReviews();
        setShowForm(false);
        setHasReviewed(true);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await apiClient.delete(`/api/reviews/${reviewId}`);
      if (res.data.ok) {
        await fetchReviews();
        setHasReviewed(false);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await apiClient.patch("/api/reviews/helpful", {
        reviewId,
        helpful: true,
      });
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    }
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
        : 0,
  }));

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filter === "verified") return review.verified;
    if (typeof filter === "number") return review.rating === filter;
    return true;
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-1/3" />
          <div className="h-32 bg-neutral-800 rounded" />
          <div className="h-32 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* LEFT — Rating summary + Write Review */}
      <div className="space-y-4">
        {/* Rating Summary */}
        <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-6 backdrop-blur-sm space-y-5">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-1">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="md" />
            <p className="text-neutral-400 text-sm mt-2">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-neutral-400 text-sm w-3">{star}</span>
                <Star className="w-3 h-3 text-neutral-600 fill-neutral-600" />
                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-neutral-500 text-xs w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-5 backdrop-blur-sm space-y-3">
          {showForm ? (
            <ReviewForm
              productId={productId}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowForm(false)}
            />
          ) : isLoggedIn && hasPurchased && !hasReviewed && !isOwner ? (
            <>
              <p className="text-sm text-neutral-300 font-medium">Share your experience</p>
              <p className="text-xs text-neutral-500">Help others make the right choice with your honest review.</p>
              <Button
                onClick={() => setShowForm(true)}
                className="w-full backdrop-blur-md bg-violet-500/20 border border-violet-500/40 text-violet-200 hover:bg-violet-500/30 hover:border-violet-400/60 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </>
          ) : isLoggedIn && hasReviewed ? (
            <p className="text-sm text-emerald-400 flex items-center gap-2">
              <Star className="w-4 h-4 fill-emerald-400" />
              You&apos;ve reviewed this product
            </p>
          ) : isLoggedIn && isOwner ? (
            <p className="text-sm text-neutral-500">You cannot review your own product.</p>
          ) : isLoggedIn && !hasPurchased ? (
            <p className="text-sm text-neutral-500">Purchase this product to leave a review.</p>
          ) : (
            <Button
              variant="outline"
              className="w-full backdrop-blur-md bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all duration-200"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in to Review
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT — Reviews List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filter Tabs */}
        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-400 text-sm mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === "all"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-neutral-800/50 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === "verified"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-neutral-800/50 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-800"
              }`}
            >
              Verified
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilter(filter === star ? "all" : star)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${
                  filter === star
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-neutral-800/50 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-800"
                }`}
              >
                {star} <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-neutral-800/50 bg-neutral-900/30">
              <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">
                {reviews.length === 0
                  ? isOwner
                    ? "No reviews yet."
                    : "No reviews yet. Be the first to review!"
                  : "No reviews match the selected filter."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isOwnReview={review.userId === userId}
                onHelpful={handleMarkHelpful}
                onDelete={handleDeleteReview}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {filteredReviews.length > 10 && (
          <div className="text-center">
            <Button variant="outline" className="border-neutral-700 text-neutral-300">
              <ChevronDown className="w-4 h-4 mr-2" />
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
