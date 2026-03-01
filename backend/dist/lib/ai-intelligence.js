"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIIntelligenceEngine = void 0;
const zod_1 = require("zod");
const generative_ai_1 = require("@google/generative-ai");
const crypto_1 = __importDefault(require("crypto"));
const PricingRecommendationSchema = zod_1.z.object({
    min: zod_1.z.number().min(0),
    max: zod_1.z.number().min(0),
    optimal: zod_1.z.number().min(0),
    reasoning: zod_1.z.string().min(10),
});
const CompetitiveAnalysisSchema = zod_1.z.object({
    competitorCount: zod_1.z.number().min(0),
    avgPrice: zod_1.z.number().min(0),
    commonFeatures: zod_1.z.array(zod_1.z.string()),
    marketGaps: zod_1.z.array(zod_1.z.string()),
    pricingRecommendation: PricingRecommendationSchema,
});
const PricingIntelligenceSchema = zod_1.z.object({
    marketAverage: zod_1.z.number().min(0),
    priceRange: zod_1.z.object({
        min: zod_1.z.number().min(0),
        max: zod_1.z.number().min(0),
        median: zod_1.z.number().min(0),
    }),
    positioning: zod_1.z.enum(["low", "medium", "high"]),
    recommendation: zod_1.z.string().min(10),
});
const SEOSchema = zod_1.z.object({
    title: zod_1.z.string().min(10).max(70),
    description: zod_1.z.string().min(50).max(170),
    keywords: zod_1.z.array(zod_1.z.string()).min(3).max(15),
    metaDescription: zod_1.z.string().max(160),
    faqSchema: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string(),
        answer: zod_1.z.string(),
    })).min(1).max(5),
    tags: zod_1.z.array(zod_1.z.string()).min(2).max(10),
});
const DescriptionOptimizationSchema = zod_1.z.object({
    optimized: zod_1.z.string().min(100),
    shortVersion: zod_1.z.string().min(20).max(120),
    bulletPoints: zod_1.z.array(zod_1.z.string()).min(2).max(8),
    tone: zod_1.z.enum(["professional", "casual", "persuasive"]),
});
const TrendAnalysisSchema = zod_1.z.object({
    trendingTags: zod_1.z.array(zod_1.z.string()).min(3).max(10),
    marketSaturation: zod_1.z.enum(["low", "medium", "high"]),
    opportunityScore: zod_1.z.number().min(0).max(100),
    emergingTopics: zod_1.z.array(zod_1.z.string()).min(2).max(6),
});
const ProductStructureSchema = zod_1.z.object({
    optimizationScore: zod_1.z.number().min(0).max(100),
    titleAnalysis: zod_1.z.object({
        length: zod_1.z.enum(["good", "short", "long"]),
        clarity: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
    }),
    descriptionAnalysis: zod_1.z.object({
        depth: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
        clarity: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
    }),
    featureAnalysis: zod_1.z.object({
        count: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
        clarity: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
    }),
    pricingAnalysis: zod_1.z.object({
        competitiveness: zod_1.z.enum(["poor", "fair", "good", "excellent"]),
        reasoning: zod_1.z.string(),
    }),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
const BuyerAnalysisSchema = zod_1.z.object({
    valueAnalysis: zod_1.z.object({
        score: zod_1.z.number().min(0).max(100),
        strengths: zod_1.z.array(zod_1.z.string()),
        considerations: zod_1.z.array(zod_1.z.string()),
        priceComparison: zod_1.z.string(),
    }),
    qualityAssessment: zod_1.z.object({
        overallRating: zod_1.z.enum(["Poor", "Fair", "Good", "Very Good", "Excellent"]),
        features: zod_1.z.array(zod_1.z.string()),
        benefits: zod_1.z.array(zod_1.z.string()),
        completeness: zod_1.z.string(),
    }),
    useCases: zod_1.z.object({
        primary: zod_1.z.array(zod_1.z.string()),
        secondary: zod_1.z.array(zod_1.z.string()),
        targetAudience: zod_1.z.array(zod_1.z.string()),
    }),
    recommendation: zod_1.z.object({
        shouldBuy: zod_1.z.boolean(),
        confidence: zod_1.z.number().min(0).max(100),
        reasoning: zod_1.z.string().min(20),
        alternatives: zod_1.z.array(zod_1.z.string()),
    }),
});
class AICache {
    cache = new Map();
    defaultTTL = 24 * 60 * 60 * 1000;
    generateKey(input, type) {
        const sorted = Object.keys(input).sort().reduce((acc, key) => {
            acc[key] = input[key];
            return acc;
        }, {});
        return crypto_1.default.createHash("md5").update(`${type}:${JSON.stringify(sorted)}`).digest("hex");
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    set(key, data, ttl) {
        this.cache.set(key, { data, timestamp: Date.now(), ttl: ttl || this.defaultTTL });
    }
    clear() { this.cache.clear(); }
    size() { return this.cache.size; }
}
class AIIntelligenceEngine {
    genAI = null;
    model = null;
    cache;
    metrics;
    maxRetries = 3;
    retryDelay = 1000;
    constructor(options) {
        this.cache = new AICache();
        this.metrics = { totalCalls: 0, successfulCalls: 0, failedCalls: 0, cacheHits: 0, cacheMisses: 0, averageResponseTime: 0 };
        if (options.geminiApiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(options.geminiApiKey);
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
            });
            console.log("AI Engine initialized");
        }
        else {
            console.warn("No Gemini API key. Using fallbacks.");
        }
    }
    async callAI(prompt, schema, cacheKey, cacheTTL) {
        const startTime = Date.now();
        this.metrics.totalCalls++;
        if (cacheKey) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.metrics.cacheHits++;
                return { success: true, data: cached };
            }
            this.metrics.cacheMisses++;
        }
        if (!this.model) {
            return { success: false, error: "No AI model", fallback: this.generateFallback(schema) };
        }
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const parsed = this.parseAIResponse(text);
                const validated = schema.safeParse(parsed);
                if (validated.success) {
                    if (cacheKey)
                        this.cache.set(cacheKey, validated.data, cacheTTL);
                    this.metrics.successfulCalls++;
                    this.metrics.averageResponseTime = ((this.metrics.averageResponseTime * (this.metrics.successfulCalls - 1)) + (Date.now() - startTime)) / this.metrics.successfulCalls;
                    return { success: true, data: validated.data };
                }
            }
            catch (error) {
                if (attempt < this.maxRetries)
                    await new Promise(r => setTimeout(r, this.retryDelay * attempt));
            }
        }
        this.metrics.failedCalls++;
        return { success: false, error: "Failed after retries", fallback: this.generateFallback(schema) };
    }
    parseAIResponse(text) {
        let cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").replace(/^\s*json\s*/i, "");
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch)
            cleaned = jsonMatch[0];
        try {
            return JSON.parse(cleaned);
        }
        catch (e) {
            cleaned = cleaned.replace(/,\s*\}/g, "}").replace(/,\s*\]/g, "]").replace(/\n/g, " ");
            return JSON.parse(cleaned);
        }
    }
    generateFallback(schema) {
        // Return a generic fallback - let the calling methods handle specific fallbacks
        return {};
    }
    async analyzeCompetitors(input) {
        const cacheKey = this.cache.generateKey(input, "competitors");
        const prompt = `Analyze competitors for "${input.productCategory}":\n${input.urls.map((u, i) => `${i + 1}. ${u}`).join("\n")}\nRespond JSON: {"avgPrice":85,"commonFeatures":["F1"],"marketGaps":["G1"],"pricingRecommendation":{"min":70,"max":120,"optimal":95,"reasoning":"..."}}`;
        const result = await this.callAI(prompt, CompetitiveAnalysisSchema, cacheKey);
        return result.success ? result.data : result.fallback;
    }
    async analyzePricingIntelligence(input) {
        const prices = input.competitorPrices || [];
        const all = [input.currentPrice, ...prices];
        if (all.length >= 3) {
            const avg = all.reduce((a, b) => a + b, 0) / all.length;
            const sorted = [...all].sort((a, b) => a - b);
            const pos = input.currentPrice < avg * 0.9 ? "low" : input.currentPrice > avg * 1.1 ? "high" : "medium";
            return { marketAverage: Math.round(avg), priceRange: { min: Math.min(...all), max: Math.max(...all), median: sorted[Math.floor(sorted.length / 2)] }, positioning: pos, recommendation: `Price is ${pos}` };
        }
        const result = await this.callAI(`Analyze pricing for ${input.productCategory} at ${input.currentPrice}. JSON: {"marketAverage":85,"priceRange":{"min":50,"max":150,"median":80},"positioning":"medium","recommendation":"..."}`, PricingIntelligenceSchema, this.cache.generateKey(input, "pricing"));
        return result.success ? result.data : result.fallback;
    }
    async generateSEO(input) {
        const result = await this.callAI(`Generate SEO for: ${input.title}. JSON: {"title":"...","description":"...","keywords":[...],"metaDescription":"...","faqSchema":[...],"tags":[...]}`, SEOSchema, this.cache.generateKey(input, "seo"));
        return result.success ? result.data : result.fallback;
    }
    async optimizeDescription(input) {
        const result = await this.callAI(`Optimize desc for ${input.title}. JSON: {"optimized":"...","shortVersion":"...","bulletPoints":[...],"tone":"${input.targetTone}"}`, DescriptionOptimizationSchema, this.cache.generateKey(input, "desc"));
        return result.success ? result.data : result.fallback;
    }
    async analyzeTrends(input) {
        const result = await this.callAI(`Analyze trends for ${input.category}. JSON: {"trendingTags":[...],"marketSaturation":"medium","opportunityScore":75,"emergingTopics":[...]}`, TrendAnalysisSchema, this.cache.generateKey(input, "trends"));
        return result.success ? result.data : result.fallback;
    }
    async analyzeProductStructure(input) {
        const titleLen = input.title.length < 30 ? "short" : input.title.length > 80 ? "long" : "good";
        const descDepth = input.description.length < 100 ? "poor" : input.description.length < 300 ? "fair" : input.description.length < 500 ? "good" : "excellent";
        const featCount = input.features.length < 3 ? "poor" : input.features.length < 5 ? "fair" : input.features.length < 8 ? "good" : "excellent";
        const recs = [];
        if (titleLen === "short")
            recs.push("Expand title");
        if (descDepth === "poor")
            recs.push("Add description details");
        if (featCount === "poor")
            recs.push("List more features");
        const score = Math.min(100, Math.max(40, (titleLen === "good" ? 20 : 10) + (descDepth === "excellent" ? 25 : descDepth === "good" ? 20 : 10) + (featCount === "excellent" ? 25 : featCount === "good" ? 20 : 10) + (input.pricing < 300 ? 20 : 10) + (input.deliverables.length > 0 ? 15 : 5)));
        return { optimizationScore: score, titleAnalysis: { length: titleLen, clarity: "good" }, descriptionAnalysis: { depth: descDepth, clarity: "good" }, featureAnalysis: { count: featCount, clarity: "good" }, pricingAnalysis: { competitiveness: input.pricing < 150 ? "good" : "fair", reasoning: "Standard" }, recommendations: recs };
    }
    async comprehensiveAnalysis(input) {
        const [seo, content, structure, competitor, trends] = await Promise.all([
            this.generateSEO({ title: input.title, description: input.description, category: input.category, features: input.features, targetAudience: input.targetAudience }),
            this.optimizeDescription({ title: input.title, description: input.description, features: input.features, targetTone: "professional" }),
            this.analyzeProductStructure({ title: input.title, description: input.description, features: input.features, pricing: input.pricing, deliverables: input.deliverables }),
            input.competitorUrls.length > 0 ? this.analyzeCompetitors({ urls: input.competitorUrls, productCategory: input.category }) : Promise.resolve(null),
            this.analyzeTrends({ category: input.category, timeframe: "30d" }),
        ]);
        return { seo, content, structure, competitor, trends, optimizationScore: structure.optimizationScore };
    }
    async analyzeProductForBuyers(input) {
        const result = await this.callAI(`Analyze for buyers: ${input.title} (${input.price}). JSON: {"valueAnalysis":{"score":75,"strengths":[...],"considerations":[...],"priceComparison":"..."},"qualityAssessment":{"overallRating":"Good","features":[...],"benefits":[...],"completeness":"..."},"useCases":{"primary":[...],"secondary":[...],"targetAudience":[...]},"recommendation":{"shouldBuy":true,"confidence":80,"reasoning":"...","alternatives":[...]}}`, BuyerAnalysisSchema, this.cache.generateKey(input, "buyer"));
        return result.success ? result.data : result.fallback;
    }
    getMetrics() { return { ...this.metrics }; }
    getCacheStats() { const total = this.metrics.cacheHits + this.metrics.cacheMisses; return { size: this.cache.size(), hitRate: total > 0 ? (this.metrics.cacheHits / total) * 100 : 0 }; }
    clearCache() { this.cache.clear(); }
}
exports.AIIntelligenceEngine = AIIntelligenceEngine;
exports.default = AIIntelligenceEngine;
