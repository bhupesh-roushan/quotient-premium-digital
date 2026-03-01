import { Router } from "express";
import { User } from "../models/User";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

/** Express router for user profile endpoints — mounted at /api/user. All routes require auth. */
const userRouter = Router();

/** Multer middleware configured for in-memory file buffering (no disk writes). */
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/user/profile/photo  [protected]
 * Accepts a multipart photo upload, streams it to Cloudinary under
 * users/:userId/, then persists the returned secure_url on the User document.
 */
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

/**
 * GET /api/user/profile  [protected]
 * Returns the authenticated user's full profile, excluding the passwordHash field.
 */
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

/**
 * PATCH /api/user/profile  [protected]
 * Updates the authenticated user's name and/or email. Only provided fields are changed.
 */
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
