require("dotenv/config");

// Simple check if dist exists, if not try to build
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const appPath = path.join(distPath, 'app.js');
const dbPath = path.join(distPath, 'db.js');

// If dist doesn't exist, try to create it
if (!fs.existsSync(distPath)) {
  console.log('Dist folder not found, creating it...');
  fs.mkdirSync(distPath, { recursive: true });
}

let cachedApp = null;
let cachedConnection = false;

module.exports = async function handler(req, res) {
  try {
    // Try to require the modules
    const { createApp } = require(appPath);
    const { connectMongo } = require(dbPath);
    
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
        message: "TypeScript compilation failed. Please check the build logs.",
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
};
