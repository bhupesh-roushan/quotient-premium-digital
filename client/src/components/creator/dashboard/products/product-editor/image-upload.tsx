"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  productId: string;
  onImagesUploaded: () => void;
}

export function ImageUpload({ productId, onImagesUploaded }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleImageUpload = async () => {
    if (!imageUrl.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.post(`/api/creator/products/${productId}/upload-image`, {
        imageUrl,
        assetType: "preview",
      });

      if (response.data.ok) {
        setImageUrl("");
        onImagesUploaded();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (jpg, png, webp, gif)');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', 'preview');
      
      const response = await apiClient.post(`/api/creator/products/${productId}/upload-image-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.ok) {
        onImagesUploaded();
      } else {
        toast.error(response.data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingFile(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <Card className="border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-white p-4 md:p-5 rounded-lg m-4">
      <CardHeader>
        <CardTitle className="text-white">Image Upload</CardTitle>
        <CardDescription className="text-neutral-400">
          Add preview images to your product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Upload Image File</label>
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadingFile}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingFile}
                className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white hover:text-white transition-all w-full"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFile ? "Uploading..." : "Upload Image File"}
                </span>
              </Button>
            </div>
          </label>
          <p className="text-xs text-neutral-500">Supports: JPG, PNG, WebP, GIF</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900/50 backdrop-blur-sm px-2 text-neutral-500 border border-neutral-800 rounded">Or</span>
          </div>
        </div>

        {/* URL Upload */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Image URL</label>
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="flex-1 h-10 rounded-lg bg-neutral-900/50 text-white border border-neutral-700 backdrop-blur-sm focus:border-violet-500/50"
            />
            <Button
              onClick={handleImageUpload}
              disabled={loading || !imageUrl.trim()}
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-pink-500/50 text-white transition-all"
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ImageUpload;
