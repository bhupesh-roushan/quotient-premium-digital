"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/** Hashes a plain-text password using bcrypt with 10 salt rounds. */
async function hashPassword(pass) {
    return bcryptjs_1.default.hash(pass, 10);
}
/** Compares a plain-text password against a stored bcrypt hash. Returns true if they match. */
async function verifyPassword(pass, hashPass) {
    return bcryptjs_1.default.compare(pass, hashPass);
}
/** Signs a JWT with the app secret and expiry defined in env vars. */
function signJwt(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}
/** Verifies a JWT string and returns the decoded payload. Throws if invalid or expired. */
function verifyJwt(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
}
