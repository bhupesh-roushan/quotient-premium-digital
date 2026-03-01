require("dotenv/config");

// Dynamic import to handle ES modules
async function handler(req, res) {
  try {
    // Import the modules dynamically
    const { createApp } = await import("./app.js");
    const { connectMongo } = await import("./db.js");
    
    // Connect to MongoDB if not already connected
    if (!global.mongoConnection) {
      await connectMongo();
      global.mongoConnection = true;
    }

    // Get or create the Express app
    if (!global.app) {
      global.app = createApp();
    }

    return global.app(req, res);
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}

module.exports = handler;
