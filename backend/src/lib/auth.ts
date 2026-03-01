import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/** Shape of the decoded JWT payload used throughout the app. */
export type JwtPayload = { userId: string };

/** Hashes a plain-text password using bcrypt with 10 salt rounds. */
export async function hashPassword(pass: string) {
  return bcrypt.hash(pass, 10);
}

/** Compares a plain-text password against a stored bcrypt hash. Returns true if they match. */
export async function verifyPassword(pass: string, hashPass: string) {
  return bcrypt.compare(pass, hashPass);
}

/** Signs a JWT with the app secret and expiry defined in env vars. */
export function signJwt(payload: jwt.JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

/** Verifies a JWT string and returns the decoded payload. Throws if invalid or expired. */
export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
