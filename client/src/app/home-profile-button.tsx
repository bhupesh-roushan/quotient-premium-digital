"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, User, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  isCreator?: boolean;
}

interface ProfileButtonProps {
  user: UserProfile | null;
}

function ProfilePopup({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  user: UserProfile | null;
  onUpdate: (user: UserProfile) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await apiClient.post("/api/user/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.ok && res.data.photo) {
        onUpdate({ ...user, photo: res.data.photo });
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setUploading(false);
    }
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 right-6 z-50 w-80 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-6 pb-4 border-b border-neutral-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 flex items-center justify-center transition-colors cursor-pointer cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>

            <div className="p-6 space-y-6">
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
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all border ${
                      uploading
                        ? "bg-neutral-800/50 border-neutral-700 text-neutral-400"
                        : "bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Name</p>
                    <p className="text-white font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Email</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
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

export function HomeProfileButton({ initialUser }: { initialUser: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(initialUser);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-neutral-900/50 border-neutral-800 backdrop-blur-sm flex items-center justify-center hover:bg-neutral-800/50 transition-all shadow-2xl cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {user?.photo ? (
          <Image
            src={user.photo}
            alt={user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </motion.button>

      <ProfilePopup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        user={user}
        onUpdate={setUser}
      />
    </>
  );
}
