"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = interactive
          ? starIndex <= (hoverRating || rating)
          : starIndex <= rating;

        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-neutral-600"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingSummaryProps {
  averageRating: number;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingSummary({
  averageRating,
  reviewCount,
  size = "md",
  showCount = true,
}: RatingSummaryProps) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(averageRating)} size={size} />
      {showCount && (
        <span className="text-neutral-400 text-sm">
          {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
