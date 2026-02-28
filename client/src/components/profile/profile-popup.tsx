"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, User, Mail, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { getMeClient } from "@/lib/auth/getMeClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  isCreator?: boolean;
}

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePopup({ isOpen, onClose }: ProfilePopupProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const fetchUser = async () => {
    const me = await getMeClient();
    if (me.ok && me.user) {
      setUser(me.user as UserProfile);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.size);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      console.log("Uploading to /api/user/profile/photo");
      const res = await apiClient.post("/api/user/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", res.data);
      if (res.data.ok) {
        await fetchUser();
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      const res = await apiClient.post("/api/auth/logout");
      if (res.data.ok) {
        onClose();
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-6 z-50 w-80 bg-neutral-900/90 backdrop-blur-md border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-neutral-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Photo Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                      {user.photo ? (
                        <Image
                          src={user.photo}
                          alt={user.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-neutral-400" />
                      )}
                    </div>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-neutral-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Name</p>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-neutral-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Email</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-neutral-800/50 border-neutral-700 text-white hover:bg-neutral-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
