import { Router } from "express";
import { User } from "../models/User";
import { hashPassword, signJwt, verifyPassword } from "../lib/auth";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";

/** Express router for all authentication endpoints — mounted at /api/auth */
export const authRouter = Router();

/**
 * POST /api/auth/register
 * Creates a new user account. Validates uniqueness of email, hashes password,
 * and returns the created user profile (no session/cookie set on register).
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        error: "name, email , password needed",
      });
    }

    const exists = await User.findOne({
      email: String(email).toLowerCase(),
    }).lean();

    if (exists) {
      return res.status(400).json({
        ok: false,
        error: "Email already in use",
      });
    }

    const passwordHash = await hashPassword(String(password));

    const newlyCreatedUser = await User.create({
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
  } catch (e) {
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
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "email , password needed",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    const okPassword = await verifyPassword(
      String(password),
      user.passwordHash
    );

    if (!okPassword) {
      return res.status(400).json({
        ok: false,
        error: "Invalid credentials",
      });
    }

    const token = signJwt({ userId: String(user._id) });

    console.log("Setting cookie - Name:", process.env.COOKIE_NAME);
    console.log("Setting cookie - Token:", token.substring(0, 50) + "...");

    res.cookie(process.env.COOKIE_NAME!, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("Cookie set successfully");

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
  } catch (e) {
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
authRouter.post("/logout", async (req, res) => {
  try {
    console.log("Logout request received");
    res.clearCookie(process.env.COOKIE_NAME!, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    
    console.log("Cookie cleared, sending response");
    return res.json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    console.log("Logout error:", err);
    res.status(500).json({ ok: false, error: "Logout failed" });
  }
});

/**
 * GET /api/auth/me  [protected]
 * Returns the currently authenticated user's profile, populated by requireAuth middleware.
 */
authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    return res.json({ ok: true, user: req.user });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
});
