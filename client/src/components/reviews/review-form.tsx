"use client";

import React, { useState } from "react";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, X } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSubmit: (review: {
    rating: number;
    title: string;
    content: string;
  }) => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{
    rating?: string;
    title?: string;
    content?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!title.trim()) newErrors.title = "Please enter a title";
    if (title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!content.trim()) newErrors.content = "Please enter your review";
    if (content.trim().length < 10)
      newErrors.content = "Review must be at least 10 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ rating, title: title.trim(), content: content.trim() });

    // Reset form
    setRating(0);
    setTitle("");
    setContent("");
    setErrors({});
  };

  return (
    <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Write a Review</h3>
            <p className="text-neutral-400 text-sm">
              Share your experience with this product
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Your Rating *
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onRatingChange={setRating}
            />
            {rating > 0 && (
              <span className="text-neutral-400 text-sm">
                {rating === 5 && "Excellent!"}
                {rating === 4 && "Very Good"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Poor"}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="text-red-400 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Review Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Your Review *
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you like or dislike? How was your experience using this product?"
            rows={4}
            className="bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 resize-none"
          />
          {errors.content && (
            <p className="text-red-400 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white"
          >
            Submit Review
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
