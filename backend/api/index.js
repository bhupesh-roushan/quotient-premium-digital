require("dotenv/config");
const { createApp } = require("../dist/app");
const { connectMongo } = require("../dist/db");

let cachedApp = null;
let cachedConnection = false;

module.exports = async function handler(req, res) {
  try {
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
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};
