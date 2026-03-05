"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const User_1 = require("../models/User");
const auth_1 = require("../lib/auth");
const requireAuth_1 = require("../middleware/requireAuth");
/** Express router for all authentication endpoints — mounted at /api/auth */
exports.authRouter = (0, express_1.Router)();
/**
 * POST /api/auth/register
 * Creates a new user account. Validates uniqueness of email, hashes password,
 * and returns the created user profile (no session/cookie set on register).
 */
exports.authRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body ?? {};
        if (!name || !email || !password) {
            return res.status(400).json({
                ok: false,
                error: "name, email , password needed",
            });
        }
        const exists = await User_1.User.findOne({
            email: String(email).toLowerCase(),
        }).lean();
        if (exists) {
            return res.status(400).json({
                ok: false,
                error: "Email already in use",
            });
        }
        const passwordHash = await (0, auth_1.hashPassword)(String(password));
        const newlyCreatedUser = await User_1.User.create({
            name: String(name),
            email: String(email).toLowerCase(),
            passwordHash,
            isCreator: false,
        });
        return res.json({
            ok: true,
            message: "Account created successfully!",
            user: {
                id: String(newlyCreatedUser._id),
                name: newlyCreatedUser.name,
                email: newlyCreatedUser.email,
                isCreator: newlyCreatedUser.isCreator,
            },
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
/**
 * POST /api/auth/login
 * Authenticates user with email + password, issues a signed JWT stored
 * as an httpOnly cookie valid for 7 days.
 */
exports.authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                error: "email , password needed",
            });
        }
        const user = await User_1.User.findOne({
            email: String(email).toLowerCase(),
        });
        if (!user) {
            return res.status(400).json({
                ok: false,
                error: "Invalid credentials",
            });
        }
        const okPassword = await (0, auth_1.verifyPassword)(String(password), user.passwordHash);
        if (!okPassword) {
            return res.status(400).json({
                ok: false,
                error: "Invalid credentials",
            });
        }
        console.log("=== LOGIN DEBUG ===");
        console.log("Request origin:", req.headers.origin);
        console.log("Request headers:", req.headers);
        console.log("Environment variables:");
        console.log("- COOKIE_NAME:", process.env.COOKIE_NAME);
        console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
        console.log("- JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
        const token = (0, auth_1.signJwt)({ userId: String(user._id) });
        console.log("Setting cookie - Name:", process.env.COOKIE_NAME);
        console.log("Setting cookie - Token:", token.substring(0, 50) + "...");
        console.log("Environment check - NODE_ENV:", process.env.NODE_ENV);
        console.log("Environment check - VERCEL_ENV:", process.env.VERCEL_ENV);
        const cookieOptions = {
            httpOnly: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        // Production: secure + sameSite none for cross-subdomain
        // Check both NODE_ENV and VERCEL_ENV
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
            cookieOptions.secure = true;
            cookieOptions.sameSite = 'none';
            // Don't set domain - let browser handle it
            console.log("Using PRODUCTION cookie settings");
        }
        else {
            cookieOptions.sameSite = 'lax';
            console.log("Using DEVELOPMENT cookie settings");
        }
        console.log("Final cookie options:", cookieOptions);
        res.cookie(process.env.COOKIE_NAME, token, cookieOptions);
        console.log("Cookie set successfully");
        console.log("=== END LOGIN DEBUG ===");
        return res.json({
            ok: true,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                photo: user.photo,
                isCreator: user.isCreator,
            },
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
/**
 * POST /api/auth/logout
 * Clears the auth cookie to end the user's session.
 */
exports.authRouter.post("/logout", async (req, res) => {
    try {
        console.log("Logout request received");
        const cookieOptions = {
            httpOnly: true,
            path: "/",
        };
        // Production: secure + sameSite none for cross-subdomain
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
            cookieOptions.secure = true;
            cookieOptions.sameSite = 'none';
            // Don't set domain - let browser handle it
        }
        else {
            cookieOptions.sameSite = 'lax';
        }
        res.clearCookie(process.env.COOKIE_NAME, cookieOptions);
        console.log("Cookie cleared, sending response");
        return res.json({ ok: true, message: "Logged out successfully" });
    }
    catch (err) {
        console.log("Logout error:", err);
        res.status(500).json({ ok: false, error: "Logout failed" });
    }
});
/**
 * GET /api/auth/me  [protected]
 * Returns the currently authenticated user's profile, populated by requireAuth middleware.
 */
exports.authRouter.get("/me", requireAuth_1.requireAuth, async (req, res) => {
    try {
        console.log("=== /API/AUTH/ME DEBUG ===");
        console.log("User authenticated successfully:", req.user);
        console.log("=== END /API/AUTH/ME DEBUG ===");
        return res.json({ ok: true, user: req.user });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            error: "Internal server error",
        });
    }
});
