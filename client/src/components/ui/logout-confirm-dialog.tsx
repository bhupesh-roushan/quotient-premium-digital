"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  userName?: string;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  userName,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-96 bg-neutral-900/50 border-neutral-800 backdrop-blur-sm" showCloseButton={false}>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 backdrop-blur-sm border border-red-500/30 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-red-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-center gap-2">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Are you sure you want to log out{userName ? `, ${userName}?` : "?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            onClick={onCancel}
            className="flex-1 h-11 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 text-white transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
