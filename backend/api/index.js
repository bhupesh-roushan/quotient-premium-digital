require("dotenv/config");

// API Handler for Vercel deployment - v7 (Direct Test)
let cachedApp = null;
let cachedConnection = false;

module.exports = async function handler(req, res) {
  // Add cache busting header
  res.setHeader('x-cache-bust', Date.now());
  
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
