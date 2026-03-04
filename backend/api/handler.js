require("dotenv/config");

// API Handler for Vercel deployment - FINAL WORKING VERSION
let cachedApp = null;
let cachedConnection = false;

// Import auth functions directly
const { signJwt, verifyJwt } = require("../dist/lib/auth");
const { User } = require("../dist/models/User");

module.exports = async function handler(req, res) {
  console.log("=== HANDLER CALLED ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  
  // Add CORS headers to all responses (single origin)
  const origin = req.headers.origin;
  if (origin === "https://quotient-premium-digital.vercel.app" || 
      origin === "http://quotient-premium-digital.vercel.app" ||
      origin === "http://localhost:3000" ||
      origin === "https://localhost:3000") {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Add cache busting header
  res.setHeader('x-cache-bust', Date.now());
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("=== OPTIONS REQUEST ===");
    return res.status(200).end();
  }
  
  // Simple test endpoint to verify handler is working
  if (req.url === '/api/test') {
    console.log("=== TEST ENDPOINT CALLED ===");
    return res.json({ 
      message: "Handler is working!",
      timestamp: new Date().toISOString(),
      headers: req.headers
    });
  }
  
  // Helper function to parse cookies
  function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
  }
  
  // Helper function to get auth token
  function getAuthToken(req) {
    const cookies = parseCookies(req.headers.cookie);
    const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
    return cookies[cookieName];
  }
  
  // POST /api/auth/login
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    console.log("=== DIRECT LOGIN ===");
    try {
      let body = req.body;
      if (!body && req.headers['content-type']?.includes('application/json')) {
        const chunks = [];
        const bodyString = await new Promise((resolve, reject) => {
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks).toString()));
          req.on('error', reject);
        });
        body = JSON.parse(bodyString);
      }
      
      const { email, password } = body || {};
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: "Email and password required" });
      }
      
      if (!cachedConnection) {
        const { connectMongo } = require("../dist/db");
        await connectMongo();
        cachedConnection = true;
      }
      
      const user = await User.findOne({ email: String(email).toLowerCase() });
      if (!user) {
        return res.status(400).json({ ok: false, error: "Invalid credentials" });
      }
      
      const bcrypt = require('bcryptjs');
      const okPassword = await bcrypt.compare(String(password), user.passwordHash);
      if (!okPassword) {
        return res.status(400).json({ ok: false, error: "Invalid credentials" });
      }
      
      const token = signJwt({ userId: String(user._id) });
      
      // Set cookie with minimal working configuration
      const cookieValue = `${process.env.COOKIE_NAME || 'quotient_cookie_creations'}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
      res.setHeader('Set-Cookie', cookieValue);
      console.log("Cookie set:", cookieValue.substring(0, 100) + "...");
      
      console.log("Login successful for:", email);
      
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
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  }
  
  // GET /api/auth/me
  if (req.url === '/api/auth/me' && req.method === 'GET') {
    console.log("=== DIRECT /ME ===");
    try {
      const token = getAuthToken(req);
      console.log("Token found:", !!token);
      
      if (!token) {
        return res.status(401).json({ ok: false, error: "Please log in" });
      }
      
      const payload = verifyJwt(token);
      
      if (!cachedConnection) {
        const { connectMongo } = require("../dist/db");
        await connectMongo();
        cachedConnection = true;
      }
      
      const user = await User.findById(payload.userId).lean();
      if (!user) {
        return res.status(401).json({ ok: false, error: "Invalid session" });
      }
      
      console.log("Auth successful for:", user.email);
      
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
    } catch (error) {
      console.error("/me error:", error);
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }
  }
  
  // POST /api/auth/logout
  if (req.url === '/api/auth/logout' && req.method === 'POST') {
    console.log("=== DIRECT LOGOUT ===");
    const cookieValue = `${process.env.COOKIE_NAME || 'quotient_cookie_creations'}=; HttpOnly; Path=/; Max-Age=0`;
    res.setHeader('Set-Cookie', cookieValue);
    return res.json({ ok: true, message: "Logged out successfully" });
  }
  
  // If no auth route matched, try Express app (for other routes)
  try {
    console.log("=== PASSING TO EXPRESS ===");
    const { createApp } = require("../dist/app");
    const { connectMongo } = require("../dist/db");
    
    if (!cachedConnection) {
      await connectMongo();
      cachedConnection = true;
    }

    if (!cachedApp) {
      cachedApp = createApp();
    }

    return cachedApp(req, res);
  } catch (error) {
    console.error("Express error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
