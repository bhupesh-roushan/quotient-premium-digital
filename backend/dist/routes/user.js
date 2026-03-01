"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const requireAuth_1 = require("../middleware/requireAuth");
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
/** Express router for user profile endpoints — mounted at /api/user. All routes require auth. */
const userRouter = (0, express_1.Router)();
/** Multer middleware configured for in-memory file buffering (no disk writes). */
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
/**
 * POST /api/user/profile/photo  [protected]
 * Accepts a multipart photo upload, streams it to Cloudinary under
 * users/:userId/, then persists the returned secure_url on the User document.
 */
userRouter.post("/profile/photo", requireAuth_1.requireAuth, upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, error: "No photo provided" });
        }
        const userId = req.user.id;
        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: `users/${userId}`,
                resource_type: "image",
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.secure_url);
                }
            });
            stream.end(req.file.buffer);
        });
        const photoUrl = await uploadPromise;
        // Update user in database
        await User_1.User.findByIdAndUpdate(userId, { photo: photoUrl });
        res.json({ ok: true, photo: photoUrl });
    }
    catch (error) {
        console.error("Failed to upload profile photo:", error);
        res.status(500).json({ ok: false, error: "Failed to upload photo" });
    }
});
/**
 * GET /api/user/profile  [protected]
 * Returns the authenticated user's full profile, excluding the passwordHash field.
 */
userRouter.get("/profile", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        res.json({ ok: true, user });
    }
    catch (error) {
        console.error("Failed to get user profile:", error);
        res.status(500).json({ ok: false, error: "Failed to get profile" });
    }
});
/**
 * PATCH /api/user/profile  [protected]
 * Updates the authenticated user's name and/or email. Only provided fields are changed.
 */
userRouter.patch("/profile", requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (email)
            updates.email = email;
        const user = await User_1.User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        res.json({ ok: true, user });
    }
    catch (error) {
        console.error("Failed to update profile:", error);
        res.status(500).json({ ok: false, error: "Failed to update profile" });
    }
});
exports.default = userRouter;
