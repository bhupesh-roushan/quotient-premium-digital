require("dotenv/config");

// API Handler for Vercel deployment - v9 (Final Fix - 2025-03-05-02:33)
let cachedApp = null;
let cachedConnection = false;

// Import auth functions directly
const { signJwt, verifyJwt } = require("../dist/lib/auth");
const { User } = require("../dist/models/User");

module.exports = async function handler(req, res) {
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
    return res.status(200).end();
  }
  
  // Simple test to confirm direct handler is working
  if (req.url === '/api/auth/test-direct') {
    return res.json({ 
      message: "Direct handler is working!",
      timestamp: new Date().toISOString()
    });
  }
  
  // Direct test endpoint
  if (req.url === '/api/auth/direct-test') {
    console.log("=== DIRECT TEST CALLED ===");
    return res.json({ 
      ok: true, 
      message: "Direct API handler test works!",
      timestamp: new Date().toISOString()
    });
  }
  
  // Direct ping endpoint to bypass Express
  if (req.url === '/api/auth/ping') {
    console.log("=== DIRECT PING CALLED ===");
    return res.json({ 
      ok: true, 
      message: "Direct routing works!",
      timestamp: new Date().toISOString()
    });
  }
  
  // Direct debug endpoint
  if (req.url === '/api/auth/debug') {
    console.log("=== DIRECT DEBUG CALLED ===");
    return res.json({ 
      ok: true, 
      message: "Direct debug works!",
      env: {
        COOKIE_NAME: process.env.COOKIE_NAME || "NOT_SET",
        JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT_SET",
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "NOT_SET"
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Direct login implementation
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    console.log("=== DIRECT LOGIN CALLED ===");
    try {
      console.log("Request headers:", req.headers);
      console.log("Request method:", req.method);
      console.log("Request URL:", req.url);
      
      // Parse request body if it's not already parsed
      let body = req.body;
      console.log("Initial req.body:", req.body);
      
      if (!body && req.headers['content-type']?.includes('application/json')) {
        console.log("Parsing JSON body...");
        try {
          // Simple JSON parsing for Vercel environment
          const chunks = [];
          const bodyString = await new Promise((resolve, reject) => {
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks).toString()));
            req.on('error', reject);
          });
          console.log("Raw body string:", bodyString);
          body = JSON.parse(bodyString);
          console.log("Parsed body:", body);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          return res.status(400).json({
            ok: false,
            error: "Invalid JSON in request body"
          });
        }
      }
      
      const { email, password } = body || {};
      console.log("Extracted email:", email);
      console.log("Password provided:", !!password);
      
      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({
          ok: false,
          error: "email and password are required"
        });
      }
      
      // Connect to DB if needed
      if (!cachedConnection) {
        console.log("Connecting to database...");
        try {
          const { connectMongo } = require("../dist/db");
          await connectMongo();
          cachedConnection = true;
          console.log("Database connected successfully");
        } catch (dbError) {
          console.error("Database connection error:", dbError);
          return res.status(500).json({
            ok: false,
            error: "Database connection failed",
            details: dbError.message
          });
        }
      }
      
      // Check User model
      console.log("User model:", typeof User);
      console.log("User methods:", Object.getOwnPropertyNames(User));
      
      // Find user
      console.log("Looking for user:", email.toLowerCase());
      let user;
      try {
        user = await User.findOne({ email: String(email).toLowerCase() });
        console.log("User found:", !!user);
      } catch (userError) {
        console.error("User.findOne error:", userError);
        return res.status(500).json({
          ok: false,
          error: "Database query failed",
          details: userError.message
        });
      }
      
      if (!user) {
        console.log("User not found");
        return res.status(400).json({
          ok: false,
          error: "Invalid credentials"
        });
      }
      
      console.log("User found, verifying password...");
      
      // Verify password (using bcrypt from compiled auth)
      const bcrypt = require('bcryptjs');
      let okPassword;
      try {
        okPassword = await bcrypt.compare(String(password), user.passwordHash);
        console.log("Password verification result:", okPassword);
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError);
        return res.status(500).json({
          ok: false,
          error: "Password verification failed"
        });
      }
      
      if (!okPassword) {
        console.log("Password verification failed");
        return res.status(400).json({
          ok: false,
          error: "Invalid credentials"
        });
      }
      
      console.log("Password verified, creating token...");
      
      // Create token
      let token;
      try {
        token = signJwt({ userId: String(user._id) });
        console.log("Token created successfully");
      } catch (tokenError) {
        console.error("Token creation error:", tokenError);
        return res.status(500).json({
          ok: false,
          error: "Token creation failed"
        });
      }
      
      console.log("Setting cookie - Name:", process.env.COOKIE_NAME);
      console.log("Setting cookie - Token:", token.substring(0, 50) + "...");
      
      // Set cookie using Node.js native approach for Vercel
      try {
        const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
        const cookieValue = `${process.env.COOKIE_NAME || 'quotient_auth_token'}=${token}; HttpOnly; Secure; SameSite=lax; Path=/; Domain=quotient-premium-digital.vercel.app; Max-Age=${maxAgeSeconds}`;
        res.setHeader('Set-Cookie', cookieValue);
        console.log("Cookie set successfully via Set-Cookie header");
        console.log("Cookie name:", process.env.COOKIE_NAME);
        console.log("Cookie value:", cookieValue.substring(0, 100) + "...");
      } catch (cookieError) {
        console.error("Cookie setting error:", cookieError);
        return res.status(500).json({
          ok: false,
          error: "Cookie setting failed"
        });
      }
      
      console.log("=== END DIRECT LOGIN ===");
      
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
      console.error("Direct login error:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({
        ok: false,
        error: "Internal server error",
        details: error.message
      });
    }
  }
  
  // Direct /me endpoint
  if (req.url === '/api/auth/me' && req.method === 'GET') {
    console.log("=== DIRECT /ME CALLED ===");
    try {
      // Get token from cookies
      let token = req.cookies?.[process.env.COOKIE_NAME || 'quotient_cookie_creations'];
      
      if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies[process.env.COOKIE_NAME || 'quotient_cookie_creations'];
      }
      
      console.log("Cookie name being looked for:", process.env.COOKIE_NAME || 'quotient_cookie_creations');
      console.log("Request cookies:", req.cookies);
      console.log("Cookie header:", req.headers.cookie);
      console.log("Token found:", !!token);
      
      if (!token) {
        return res.status(401).json({
          ok: false,
          error: "Unauth user! Please log in."
        });
      }
      
      // Verify token
      const payload = verifyJwt(token);
      
      // Connect to DB if needed
      if (!cachedConnection) {
        const { connectMongo } = require("../dist/db");
        await connectMongo();
        cachedConnection = true;
      }
      
      // Find user
      const user = await User.findById(payload.userId).lean();
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: "Invalid session"
        });
      }
      
      console.log("User authenticated successfully");
      console.log("=== END DIRECT /ME ===");
      
      return res.json({ 
        ok: true, 
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          photo: user.photo,
          isCreator: user.isCreator,
        }
      });
      
    } catch (error) {
      console.error("Direct /me error:", error);
      return res.status(401).json({
        ok: false,
        error: "Invalid session"
      });
    }
  }
  
  // Debug endpoint to test Express loading
  if (req.url === '/api/auth/debug-express') {
    console.log("=== DEBUG EXPRESS LOADING ===");
    try {
      console.log("1. Requiring app.js...");
      const { createApp } = require("../dist/app");
      console.log("2. App required successfully");
      
      console.log("3. Requiring db.js...");
      const { connectMongo } = require("../dist/db");
      console.log("4. DB required successfully");
      
      console.log("5. Creating Express app...");
      const app = createApp();
      console.log("6. Express app created successfully");
      
      return res.json({ 
        ok: true, 
        message: "Express app loading works!",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Express loading error:", error);
      return res.status(500).json({ 
        ok: false, 
        error: "Express loading failed",
        details: error.message
      });
    }
  }
  
  try {
    console.log("=== HANDLER START ===");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
    // Try to require the compiled modules
    console.log("Loading app.js...");
    const { createApp } = require("../dist/app");
    console.log("Loading db.js...");
    const { connectMongo } = require("../dist/db");
    
    if (!cachedConnection) {
      console.log("Connecting to MongoDB...");
      await connectMongo();
      cachedConnection = true;
      console.log("MongoDB connected");
    }

    if (!cachedApp) {
      console.log("Creating Express app...");
      cachedApp = createApp();
      console.log("Express app created");
    }

    console.log("Passing request to Express app...");
    
    // Fix: Directly call the Express app without Promise wrapper
    try {
      cachedApp(req, res);
      return;
    } catch (expressError) {
      console.error("Express app direct call error:", expressError);
      return res.status(500).json({ error: "Express app error" });
    }
    
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    
    // If module not found, provide helpful error
    if (error.message.includes('Cannot find module')) {
      return res.status(500).json({ 
        error: "Build Error", 
        message: "TypeScript compilation failed. The dist folder was not created.",
        details: "Please check that the build step ran successfully in Vercel."
      });
    }
    
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
};
