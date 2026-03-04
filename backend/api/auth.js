require("dotenv/config");

// ==========================================
// STANDALONE AUTHENTICATION API
// ==========================================
// This is a completely separate auth system
// Bypasses all existing infrastructure

const { signJwt, verifyJwt } = require("../dist/lib/auth");
const { User } = require("../dist/models/User");

// Database connection
let dbConnected = false;

async function connectDB() {
  if (!dbConnected) {
    const { connectMongo } = require("../dist/db");
    await connectMongo();
    dbConnected = true;
  }
}

// Cookie utilities
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function getToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[process.env.COOKIE_NAME || 'quotient_cookie_creations'];
}

// Main handler
module.exports = async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (["https://quotient-premium-digital.vercel.app", "http://localhost:3000"].includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  console.log(`🚀 NEW AUTH: ${req.method} ${req.url}`);
  
  try {
    await connectDB();
    
    // Login endpoint
    if (req.url === '/login' && req.method === 'POST') {
      console.log('🔑 NEW LOGIN SYSTEM');
      
      // Parse body
      let body = {};
      if (req.headers['content-type']?.includes('application/json')) {
        const chunks = [];
        body = await new Promise((resolve) => {
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch (e) {
              resolve({});
            }
          });
        });
      }
      
      const { email, password } = body;
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: "Email and password required" });
      }
      
      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ ok: false, error: "Invalid credentials" });
      }
      
      // Check password
      const bcrypt = require('bcryptjs');
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(400).json({ ok: false, error: "Invalid credentials" });
      }
      
      // Create token
      const token = signJwt({ userId: String(user._id) });
      
      // Set cookie with multiple approaches
      const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
      
      // Method 1: Set-Cookie header
      res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; Path=/; Max-Age=604800`);
      
      // Method 2: Multiple Set-Cookie headers
      res.setHeader('Set-Cookie', [
        `${cookieName}=${token}; HttpOnly; Path=/; Max-Age=604800`,
        `${cookieName}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
      ]);
      
      console.log(`✅ NEW LOGIN SUCCESS: ${email}`);
      console.log(`🍪 COOKIE SET: ${cookieName}=${token.substring(0, 20)}...`);
      
      return res.json({
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          isCreator: user.isCreator
        }
      });
    }
    
    // Me endpoint
    if (req.url === '/me' && req.method === 'GET') {
      console.log('👤 NEW AUTH CHECK');
      
      const token = getToken(req);
      console.log(`🔍 TOKEN FOUND: ${!!token}`);
      
      if (!token) {
        return res.status(401).json({ ok: false, error: "Not logged in" });
      }
      
      const payload = verifyJwt(token);
      const user = await User.findById(payload.userId);
      
      if (!user) {
        return res.status(401).json({ ok: false, error: "Invalid session" });
      }
      
      console.log(`✅ NEW AUTH SUCCESS: ${user.email}`);
      
      return res.json({
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          isCreator: user.isCreator
        }
      });
    }
    
    // Logout
    if (req.url === '/logout' && req.method === 'POST') {
      console.log('🚪 NEW LOGOUT');
      const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
      res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Path=/; Max-Age=0`);
      return res.json({ ok: true, message: "Logged out" });
    }
    
    // Register
    if (req.url === '/register' && req.method === 'POST') {
      console.log('📝 NEW REGISTER');
      
      let body = {};
      if (req.headers['content-type']?.includes('application/json')) {
        const chunks = [];
        body = await new Promise((resolve) => {
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch (e) {
              resolve({});
            }
          });
        });
      }
      
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: "All fields required" });
      }
      
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ ok: false, error: "Email exists" });
      }
      
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: hash,
        isCreator: false
      });
      
      console.log(`✅ NEW REGISTER: ${email}`);
      
      return res.json({
        ok: true,
        message: "Account created",
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          isCreator: user.isCreator
        }
      });
    }
    
    return res.status(404).json({ error: "Not found" });
    
  } catch (error) {
    console.error('❌ NEW AUTH ERROR:', error);
    return res.status(500).json({ error: "Server error" });
  }
};
