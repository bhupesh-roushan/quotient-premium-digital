"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const ai_intelligence_1 = require("../lib/ai-intelligence");
exports.aiRouter = (0, express_1.Router)();
// Initialize AI Engine
const aiEngine = new ai_intelligence_1.AIIntelligenceEngine({
    geminiApiKey: process.env.GEMINI_API_KEY || "",
});
// Buyer Product Analysis (public endpoint - before auth middleware)
exports.aiRouter.post("/buyer-analysis", async (req, res) => {
    try {
        const { title, description, category, features = [], price } = req.body;
        console.log("Buyer analysis request:", {
            title,
            description,
            category,
            features,
            price
        });
        if (!title || !description || !category) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and category are required",
            });
        }
        const analysisResult = await aiEngine.analyzeProductForBuyers({
            title,
            description,
            category,
            features,
            price: Number(price),
        });
        console.log("Buyer analysis result:", analysisResult);
        res.json({
            ok: true,
            ...analysisResult
        });
    }
    catch (error) {
        console.error("Buyer analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to perform buyer analysis",
        });
    }
});
// Apply authentication middleware to remaining routes
exports.aiRouter.use(requireAuth_1.requireAuth);
// Competitive Analysis Endpoint
exports.aiRouter.post("/analyze-competitors", async (req, res) => {
    try {
        const { urls, productCategory } = req.body;
        // Validation
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                ok: false,
                error: "Valid URLs array is required",
            });
        }
        const result = await aiEngine.analyzeCompetitors({
            urls,
            productCategory: productCategory || "general",
        });
        res.json({
            ok: true,
            data: result,
        });
    }
    catch (error) {
        console.error("Competitor analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to analyze competitors",
        });
    }
});
exports.aiRouter.post("/generate-seo", async (req, res) => {
    try {
        const { title, description, category, features, targetAudience } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and category are required",
            });
        }
        const seoResult = await aiEngine.generateSEO({
            title,
            description,
            category,
            features: features || [],
            targetAudience,
        });
        res.json({
            ok: true,
            ...seoResult
        });
    }
    catch (error) {
        console.error("SEO generation failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to generate SEO",
        });
    }
});
// Content Optimization
exports.aiRouter.post("/optimize-content", async (req, res) => {
    try {
        const { title, description, features, targetTone = "professional" } = req.body;
        if (!title || !description || !features) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and features are required",
            });
        }
        const contentResult = await aiEngine.optimizeDescription({
            title,
            description,
            features,
            targetTone,
        });
        res.json({
            ok: true,
            ...contentResult
        });
    }
    catch (error) {
        console.error("Content optimization failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to optimize content",
        });
    }
});
// Product Structure Analysis
exports.aiRouter.post("/analyze-structure", async (req, res) => {
    try {
        const { title, description, features, pricing, deliverables } = req.body;
        if (!title || !description || !features) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and features are required",
            });
        }
        const structureResult = await aiEngine.analyzeProductStructure({
            title,
            description,
            features,
            pricing: Number(pricing),
            deliverables: deliverables || [],
        });
        res.json({
            ok: true,
            ...structureResult
        });
    }
    catch (error) {
        console.error("Structure analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to analyze product structure",
        });
    }
});
// Competitive Analysis
exports.aiRouter.post("/analyze-competitors", async (req, res) => {
    try {
        const { urls, productCategory } = req.body;
        if (!urls || !productCategory) {
            return res.status(400).json({
                ok: false,
                error: "Competitor URLs and product category are required",
            });
        }
        const competitorResult = await aiEngine.analyzeCompetitors({
            urls,
            productCategory,
        });
        res.json({
            ok: true,
            ...competitorResult
        });
    }
    catch (error) {
        console.error("Competitor analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to analyze competitors",
        });
    }
});
// Pricing Intelligence
exports.aiRouter.post("/pricing-intelligence", async (req, res) => {
    try {
        const { productCategory, currentPrice, competitorPrices } = req.body;
        if (!productCategory || currentPrice === undefined) {
            return res.status(400).json({
                ok: false,
                error: "Product category and current price are required",
            });
        }
        const pricingResult = await aiEngine.analyzePricingIntelligence({
            productCategory,
            currentPrice: Number(currentPrice),
            competitorPrices: competitorPrices ? competitorPrices.map(Number) : undefined,
        });
        res.json({
            ok: true,
            ...pricingResult
        });
    }
    catch (error) {
        console.error("Pricing intelligence failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to analyze pricing intelligence",
        });
    }
});
// Trend Analysis
exports.aiRouter.post("/analyze-trends", async (req, res) => {
    try {
        const { category, timeframe = "30d" } = req.body;
        if (!category) {
            return res.status(400).json({
                ok: false,
                error: "Product category is required",
            });
        }
        const trendResult = await aiEngine.analyzeTrends({
            category,
            timeframe,
        });
        res.json({
            ok: true,
            ...trendResult
        });
    }
    catch (error) {
        console.error("Trend analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to analyze trends",
        });
    }
});
// Comprehensive Analysis (combines all features)
exports.aiRouter.post("/comprehensive-analysis", async (req, res) => {
    try {
        const { title, description, category, features = [], pricing, deliverables = [], competitorUrls = [], targetAudience } = req.body;
        console.log("Comprehensive analysis request:", {
            title,
            description,
            category,
            features,
            pricing,
            deliverables,
            competitorUrls,
            targetAudience
        });
        if (!title || !description || !category) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and category are required",
            });
        }
        const comprehensiveResult = await aiEngine.comprehensiveAnalysis({
            title,
            description,
            category,
            features,
            pricing: Number(pricing),
            deliverables,
            competitorUrls,
            targetAudience
        });
        console.log("Comprehensive analysis result:", comprehensiveResult);
        res.json({
            ok: true,
            ...comprehensiveResult
        });
    }
    catch (error) {
        console.error("Comprehensive analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to perform comprehensive analysis",
        });
    }
});
// Buyer Product Analysis (public endpoint)
exports.aiRouter.post("/buyer-analysis", async (req, res) => {
    try {
        const { title, description, category, features = [], price } = req.body;
        console.log("Buyer analysis request:", {
            title,
            description,
            category,
            features,
            price
        });
        if (!title || !description || !category) {
            return res.status(400).json({
                ok: false,
                error: "Title, description, and category are required",
            });
        }
        const analysisResult = await aiEngine.analyzeProductForBuyers({
            title,
            description,
            category,
            features,
            price: Number(price),
        });
        console.log("Buyer analysis result:", analysisResult);
        res.json({
            ok: true,
            ...analysisResult
        });
    }
    catch (error) {
        console.error("Buyer analysis failed:", error);
        res.status(500).json({
            ok: false,
            error: "Failed to perform buyer analysis",
        });
    }
});
