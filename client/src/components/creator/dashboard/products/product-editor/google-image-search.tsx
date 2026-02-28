"use client";

import { Search, Upload, Loader2, X, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { ImageAsset } from "@/lib/types/product";

interface GoogleImageSearchProps {
  productId: string;
  onImagesSelected: (images: Array<{ url: string; title: string; source: string }>) => void;
}

interface SearchResult {
  url: string;
  title: string;
  source: string;
  thumbnail?: string;
}

export function GoogleImageSearch({ productId, onImagesSelected }: GoogleImageSearchProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/api/serpapi/images", {
        query: searchQuery,
      });

      if (response.data.ok) {
        const results = response.data.images.map((img: any) => ({
          url: img.original,
          title: img.title || "Image",
          source: img.source || "Unknown",
          thumbnail: img.thumbnail,
        }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageUrl)) {
      newSelected.delete(imageUrl);
    } else {
      newSelected.add(imageUrl);
    }
    setSelectedImages(newSelected);
  };

  const handleImportSelected = async () => {
    if (selectedImages.size === 0) return;

    setLoading(true);
    try {
      const selectedImagesArray = Array.from(selectedImages);
      
      // Upload selected images to product
      const uploadPromises = selectedImagesArray.map(async (imageUrl) => {
        const response = await apiClient.post(`/api/creator/products/${productId}/upload-image?t=${Date.now()}`, {
          imageUrl,
          assetType: "preview",
        });
        return response;
      });

      const results = await Promise.all(uploadPromises);
      
      if (results.every(res => res.data.ok)) {
        // Just clear the UI and let parent refresh
        setSelectedImages(new Set());
        setSearchResults([]);
        setSearchQuery("");
        
        // Notify parent that images were imported (just for refresh)
        onImagesSelected([]);
      }
    } catch (error) {
      console.error("Error importing images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-white p-4 md:p-5 rounded-lg m-4">
      <CardHeader>
        <CardTitle className="text-white">🔍 Google Image Search</CardTitle>
        <CardDescription className="text-neutral-400">
          Search for images using Google Search API and import them to your product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1 h-10 rounded-lg bg-neutral-900/50 text-white border border-neutral-700 backdrop-blur-sm focus:border-violet-500/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <div className="text-sm text-gray-400">
                {selectedImages.size} selected
              </div>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {searchResults.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImages.has(image.url)
                      ? 'border-violet-500 ring-2 ring-violet-500'
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                  onClick={() => toggleImageSelection(image.url)}
                >
                  <div className="aspect-square bg-neutral-900">
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedImages.has(image.url)
                          ? 'bg-violet-500 border-violet-500'
                          : 'bg-neutral-900/80 border-neutral-500'
                      }`}
                    >
                      {selectedImages.has(image.url) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-neutral-950/90 backdrop-blur-sm">
                    <p className="text-xs truncate text-white font-medium">{image.title}</p>
                    <p className="text-xs text-neutral-400 truncate">{image.source}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            {selectedImages.size > 0 && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={loading}
                  className="bg-violet-600/80 backdrop-blur-sm border border-violet-500/50 hover:bg-violet-500/80 hover:border-violet-400/50 text-white transition-all w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    `Import ${selectedImages.size} Images`
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && !loading && (
          <div className="text-center py-8 text-gray-400">
            No images found. Try a different search query.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GoogleImageSearch;
