import { Router } from "express";
import { User } from "../models/User";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const userRouter = Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Update profile photo
userRouter.post(
  "/profile/photo",
  requireAuth,
  upload.single("photo"),
  async (req: AuthedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ ok: false, error: "No photo provided" });
      }

      const userId = req.user!.id;

      // Upload to Cloudinary
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `users/${userId}`,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result!.secure_url);
            }
          }
        );
        stream.end(req.file!.buffer);
      });

      const photoUrl = await uploadPromise;

      // Update user in database
      await User.findByIdAndUpdate(userId, { photo: photoUrl });

      res.json({ ok: true, photo: photoUrl });
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
      res.status(500).json({ ok: false, error: "Failed to upload photo" });
    }
  }
);

// Get user profile
userRouter.get("/profile", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, user });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    res.status(500).json({ ok: false, error: "Failed to get profile" });
  }
});

// Update user profile
userRouter.patch("/profile", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { name, email } = req.body;
    const updates: { name?: string; email?: string } = {};

    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      updates,
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, user });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ ok: false, error: "Failed to update profile" });
  }
});

export default userRouter;
