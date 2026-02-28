"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { ProfilePopup } from "./profile-popup";

export function ProfileButton() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      {/* Profile Button - Top Right Corner */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 flex items-center justify-center hover:bg-neutral-800/80 transition-colors shadow-lg"
        onClick={() => setIsProfileOpen(true)}
      >
        <User className="w-5 h-5 text-white" />
      </motion.button>

      {/* Profile Popup */}
      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
