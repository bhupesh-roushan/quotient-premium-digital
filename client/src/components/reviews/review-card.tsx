"use client";

import { StarRating } from "./star-rating";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, User } from "lucide-react";
import { useState } from "react";

interface Review {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  productId: string;
  rating: number;
  title: string;
  content: string;
  helpful: boolean;
  verified: boolean;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
  isOwnReview?: boolean;
  onHelpful?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  isOwnReview = false,
  onHelpful,
  onDelete,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(review.helpful);

  const handleHelpful = () => {
    if (onHelpful) {
      setIsHelpful(!isHelpful);
      onHelpful(review._id);
    }
  };

  // Get user data from populated userId
  const user = typeof review.userId === 'object' ? review.userId : null;
  const userName = user?.name || "Anonymous";
  const userAvatar = user?.avatar;

  return (
    <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>

          {/* User Info */}
          <div>
            <p className="text-white font-medium text-sm">
              {userName}
            </p>
            <p className="text-neutral-500 text-xs">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Verified Badge */}
      {review.verified && (
        <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">
            Verified Purchase
          </span>
        </div>
      )}

      {/* Title */}
      <h4 className="text-white font-semibold text-base mb-2">{review.title}</h4>

      {/* Content */}
      <p className="text-neutral-300 text-sm leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isHelpful
              ? "text-violet-400"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`} />
          Helpful
        </button>

        {isOwnReview && onDelete && (
          <button
            onClick={() => onDelete(review._id)}
            className="text-red-400 text-sm hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
