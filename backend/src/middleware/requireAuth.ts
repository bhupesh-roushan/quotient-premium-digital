import { Response, Request, NextFunction } from "express";
import { verifyJwt } from "../lib/auth";
import { User } from "../models/User";

/**
 * Extended Express Request that includes the authenticated user profile
 * after requireAuth middleware has run successfully.
 */
export type AuthedRequest = Request & {
  user?: { id: string; name: string; email: string; photo?: string; isCreator: Boolean };
};

/**
 * Express middleware that validates the JWT auth cookie on every protected request.
 * Reads the cookie named by COOKIE_NAME env var, verifies the JWT, fetches the
 * user from MongoDB, and attaches it to req.user before calling next().
 * Returns 401 if the token is missing, invalid, or the user no longer exists.
 */
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("Request URL:", req.url);
    console.log("Request cookies:", req.cookies);
    console.log("Request cookie header:", req.headers.cookie);
    
    // Try multiple ways to get the cookie
    let token = req.cookies?.[process.env.COOKIE_NAME!];
    
    // If not found in req.cookies, try parsing from cookie header
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies[process.env.COOKIE_NAME!];
      console.log("Parsed cookies from header:", cookies);
    }

    console.log("Auth check - Cookie name:", process.env.COOKIE_NAME);
    console.log("Auth check - Token found:", !!token);
    console.log("Auth check - Token preview:", token ? token.substring(0, 50) + "..." : "none");

    if (!token) {
      console.log("No token found - returning 401");
      return res.status(401).json({
        ok: false,
        error: "Unauth user! Please log in.",
      });
    }

    const payload = verifyJwt(token);
    console.log("JWT payload:", payload);
    
    // user -> id -> here
    const user = await User.findById(payload.userId).lean();
    console.log("Found user:", user ? {
      id: user._id,
      email: user.email,
      isCreator: user.isCreator
    } : "null");

    if (!user) {
      console.log("User not found - returning 401");
      return res.status(401).json({
        ok: false,
        error: "Invalid session",
      });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      photo: user.photo,
      isCreator: user.isCreator,
    };

    console.log("Auth success - User authenticated:", {
      id: req.user.id,
      email: req.user.email,
      isCreator: req.user.isCreator
    });
    console.log("=== END AUTHENTICATION DEBUG ===");

    next();
  } catch (err) {
    console.log("Auth error:", err);
    res.status(401).json({
      ok: false,
      error: "Invalid session",
    });
  }
}
