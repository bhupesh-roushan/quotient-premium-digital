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
  
  try {
    // Try to require the compiled modules
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
