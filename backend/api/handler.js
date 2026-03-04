require("dotenv/config");

// ==========================================
// COMPLETE AUTHENTICATION SYSTEM FOR VERCEL
// ==========================================
// Designed specifically for Vercel serverless functions
// Handles all authentication endpoints with proper cookie management

// Cache connections for performance
let cachedApp = null;
let cachedConnection = false;

// Import required modules
const { signJwt, verifyJwt } = require("../dist/lib/auth");
const { User } = require("../dist/models/User");

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Parse cookies from request header
 */
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

/**
 * Get authentication token from request
 */
function getAuthToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
  return cookies[cookieName];
}

/**
 * Set authentication cookie with Vercel-compatible format
 */
function setAuthCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  
  // Vercel-compatible cookie format
  const cookieString = `${cookieName}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  
  res.setHeader('Set-Cookie', cookieString);
  return cookieString;
}

/**
 * Clear authentication cookie
 */
function clearAuthCookie(res) {
  const cookieName = process.env.COOKIE_NAME || 'quotient_cookie_creations';
  const cookieString = `${cookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookieString);
}

/**
 * Parse JSON request body for Vercel
 */
async function parseJsonBody(req) {
  if (req.body) return req.body;
  
  if (!req.headers['content-type']?.includes('application/json')) {
    return {};
  }
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyString = Buffer.concat(chunks).toString();
        resolve(JSON.parse(bodyString));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Connect to MongoDB if not already connected
 */
async function ensureDbConnection() {
  if (!cachedConnection) {
    const { connectMongo } = require("../dist/db");
    await connectMongo();
    cachedConnection = true;
  }
}

// ==========================================
// MAIN HANDLER
// ==========================================

module.exports = async function handler(req, res) {
  // ==========================================
  // CORS & HEADERS
  // ==========================================
  
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://quotient-premium-digital.vercel.app",
    "http://quotient-premium-digital.vercel.app", 
    "http://localhost:3000",
    "https://localhost:3000"
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('x-cache-bust', Date.now().toString());
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // ==========================================
  // ROUTING
  // ==========================================
  
  const { url, method } = req;
  console.log(`🔥 ${method} ${url}`);
  
  try {
    // ==========================================
    // AUTHENTICATION ENDPOINTS
    // ==========================================
    
    // POST /api/auth/register
    if (url === '/api/auth/register' && method === 'POST') {
      console.log('📝 Register request');
      
      const body = await parseJsonBody(req);
      const { name, email, password } = body;
      
      if (!name || !email || !password) {
        return res.status(400).json({
          ok: false,
          error: "name, email, and password are required"
        });
      }
      
      await ensureDbConnection();
      
      const existingUser = await User.findOne({ 
        email: String(email).toLowerCase() 
      }).lean();
      
      if (existingUser) {
        return res.status(400).json({
          ok: false,
          error: "Email already in use"
        });
      }
      
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(String(password), 10);
      
      const newUser = await User.create({
        name: String(name),
        email: String(email).toLowerCase(),
        passwordHash,
        isCreator: false
      });
      
      console.log(`✅ User created: ${newUser.email}`);
      
      return res.json({
        ok: true,
        message: "Account created successfully!",
        user: {
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          photo: newUser.photo,
          isCreator: newUser.isCreator
        }
      });
    }
    
    // POST /api/auth/login
    if (url === '/api/auth/login' && method === 'POST') {
      console.log('🔐 Login request');
      
      const body = await parseJsonBody(req);
      const { email, password } = body;
      
      if (!email || !password) {
        return res.status(400).json({
          ok: false,
          error: "Email and password are required"
        });
      }
      
      await ensureDbConnection();
      
      const user = await User.findOne({ 
        email: String(email).toLowerCase() 
      }).lean();
      
      if (!user) {
        return res.status(400).json({
          ok: false,
          error: "Invalid credentials"
        });
      }
      
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(String(password), user.passwordHash);
      
      if (!isValidPassword) {
        return res.status(400).json({
          ok: false,
          error: "Invalid credentials"
        });
      }
      
      const token = signJwt({ userId: String(user._id) });
      const cookieString = setAuthCookie(res, token);
      
      console.log(`✅ Login successful: ${user.email}`);
      console.log(`🍪 Cookie set: ${cookieString.substring(0, 100)}...`);
      
      return res.json({
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          photo: user.photo,
          isCreator: user.isCreator
        }
      });
    }
    
    // GET /api/auth/me
    if (url === '/api/auth/me' && method === 'GET') {
      console.log('👤 Auth check request');
      
      const token = getAuthToken(req);
      console.log(`🔍 Token found: ${!!token}`);
      
      if (!token) {
        return res.status(401).json({
          ok: false,
          error: "Please log in to continue"
        });
      }
      
      const payload = verifyJwt(token);
      await ensureDbConnection();
      
      const user = await User.findById(payload.userId).lean();
      
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: "Session expired"
        });
      }
      
      console.log(`✅ Auth successful: ${user.email}`);
      
      return res.json({
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          photo: user.photo,
          isCreator: user.isCreator
        }
      });
    }
    
    // POST /api/auth/logout
    if (url === '/api/auth/logout' && method === 'POST') {
      console.log('🚪 Logout request');
      
      clearAuthCookie(res);
      
      return res.json({
        ok: true,
        message: "Logged out successfully"
      });
    }
    
    // ==========================================
    // NON-AUTH ENDPOINTS - Pass to Express
    // ==========================================
    
    console.log('➡️ Passing to Express app');
    
    const { createApp } = require("../dist/app");
    await ensureDbConnection();
    
    if (!cachedApp) {
      cachedApp = createApp();
    }
    
    return cachedApp(req, res);
    
  } catch (error) {
    console.error('❌ Handler error:', error);
    
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
