"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageCarouselProps {
  images: string[];
  title: string;
}

export function ProductImageCarousel({ images, title }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-full w-full grid place-items-center text-black/60">
        No cover image yet!
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hasMultipleImages) return;
      
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleImages, images.length]);

  return (
    <div className="relative w-full h-full">
      {/* Main image */}
      <img
        src={currentImage}
        alt={`${title} - Image ${currentIndex + 1}`}
        className="h-full w-full object-cover rounded-lg p-8"
      />
      
      {/* Image counter */}
      {hasMultipleImages && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* Navigation arrows */}
      {hasMultipleImages && (
        <>
          {/* Left arrow */}
          <Button
            onClick={goToPrevious}
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Right arrow */}
          <Button
            onClick={goToNext}
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Thumbnail strip */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Instructions hint */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          Use arrow keys to navigate
        </div>
      )}
    </div>
  );
}
