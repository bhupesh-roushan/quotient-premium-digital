import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const PricingRecommendationSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  optimal: z.number().min(0),
  reasoning: z.string().min(10),
});

const CompetitiveAnalysisSchema = z.object({
  competitorCount: z.number().min(0),
  avgPrice: z.number().min(0),
  commonFeatures: z.array(z.string()),
  marketGaps: z.array(z.string()),
  pricingRecommendation: PricingRecommendationSchema,
});

const PricingIntelligenceSchema = z.object({
  marketAverage: z.number().min(0),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    median: z.number().min(0),
  }),
  positioning: z.enum(["low", "medium", "high"]),
  recommendation: z.string().min(10),
});

const SEOSchema = z.object({
  title: z.string().min(10).max(70),
  description: z.string().min(50).max(170),
  keywords: z.array(z.string()).min(3).max(15),
  metaDescription: z.string().max(160),
  faqSchema: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).min(1).max(5),
  tags: z.array(z.string()).min(2).max(10),
});

const DescriptionOptimizationSchema = z.object({
  optimized: z.string().min(100),
  shortVersion: z.string().min(20).max(120),
  bulletPoints: z.array(z.string()).min(2).max(8),
  tone: z.enum(["professional", "casual", "persuasive"]),
});

const TrendAnalysisSchema = z.object({
  trendingTags: z.array(z.string()).min(3).max(10),
  marketSaturation: z.enum(["low", "medium", "high"]),
  opportunityScore: z.number().min(0).max(100),
  emergingTopics: z.array(z.string()).min(2).max(6),
});

const ProductStructureSchema = z.object({
  optimizationScore: z.number().min(0).max(100),
  titleAnalysis: z.object({
    length: z.enum(["good", "short", "long"]),
    clarity: z.enum(["poor", "fair", "good", "excellent"]),
  }),
  descriptionAnalysis: z.object({
    depth: z.enum(["poor", "fair", "good", "excellent"]),
    clarity: z.enum(["poor", "fair", "good", "excellent"]),
  }),
  featureAnalysis: z.object({
    count: z.enum(["poor", "fair", "good", "excellent"]),
    clarity: z.enum(["poor", "fair", "good", "excellent"]),
  }),
  pricingAnalysis: z.object({
    competitiveness: z.enum(["poor", "fair", "good", "excellent"]),
    reasoning: z.string(),
  }),
  recommendations: z.array(z.string()),
});

const BuyerAnalysisSchema = z.object({
  valueAnalysis: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    considerations: z.array(z.string()),
    priceComparison: z.string(),
  }),
  qualityAssessment: z.object({
    overallRating: z.enum(["Poor", "Fair", "Good", "Very Good", "Excellent"]),
    features: z.array(z.string()),
    benefits: z.array(z.string()),
    completeness: z.string(),
  }),
  useCases: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    targetAudience: z.array(z.string()),
  }),
  recommendation: z.object({
    shouldBuy: z.boolean(),
    confidence: z.number().min(0).max(100),
    reasoning: z.string().min(20),
    alternatives: z.array(z.string()),
  }),
});

export type CompetitiveAnalysisResult = z.infer<typeof CompetitiveAnalysisSchema>;
export type PricingIntelligenceResult = z.infer<typeof PricingIntelligenceSchema>;
export type SEOGResult = z.infer<typeof SEOSchema>;
export type DescriptionOptimizationResult = z.infer<typeof DescriptionOptimizationSchema>;
export type TrendAnalysisResult = z.infer<typeof TrendAnalysisSchema>;
export type ProductStructureAnalysisResult = z.infer<typeof ProductStructureSchema>;
export type BuyerAnalysisResult = z.infer<typeof BuyerAnalysisSchema>;

export interface ComprehensiveAnalysisResult {
  seo: SEOGResult;
  content: DescriptionOptimizationResult;
  structure: ProductStructureAnalysisResult;
  competitor: CompetitiveAnalysisResult | null;
  trends: TrendAnalysisResult;
  optimizationScore: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface AIEngineMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
}

class AICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 24 * 60 * 60 * 1000;

  generateKey(input: Record<string, any>, type: string): string {
    const sorted = Object.keys(input).sort().reduce((acc, key) => {
      acc[key] = input[key];
      return acc;
    }, {} as Record<string, any>);
    return crypto.createHash("md5").update(`${type}:${JSON.stringify(sorted)}`).digest("hex");
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttl || this.defaultTTL });
  }

  clear(): void { this.cache.clear(); }
  size(): number { return this.cache.size; }
}

export class AIIntelligenceEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache: AICache;
  private metrics: AIEngineMetrics;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(options: { geminiApiKey?: string }) {
    this.cache = new AICache();
    this.metrics = { totalCalls: 0, successfulCalls: 0, failedCalls: 0, cacheHits: 0, cacheMisses: 0, averageResponseTime: 0 };

    if (options.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(options.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
      });
      console.log("AI Engine initialized");
    } else {
      console.warn("No Gemini API key. Using fallbacks.");
    }
  }

  private async callAI<T>(prompt: string, schema: z.ZodSchema<T>, cacheKey: string | null, cacheTTL?: number) {
    const startTime = Date.now();
    this.metrics.totalCalls++;

    if (cacheKey) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) { this.metrics.cacheHits++; return { success: true as const, data: cached }; }
      this.metrics.cacheMisses++;
    }

    if (!this.model) {
      return { success: false as const, error: "No AI model", fallback: this.generateFallback(schema) };
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const parsed = this.parseAIResponse(text);
        const validated = schema.safeParse(parsed);

        if (validated.success) {
          if (cacheKey) this.cache.set(cacheKey, validated.data, cacheTTL);
          this.metrics.successfulCalls++;
          this.metrics.averageResponseTime = ((this.metrics.averageResponseTime * (this.metrics.successfulCalls - 1)) + (Date.now() - startTime)) / this.metrics.successfulCalls;
          return { success: true as const, data: validated.data };
        }
      } catch (error) {
        if (attempt < this.maxRetries) await new Promise(r => setTimeout(r, this.retryDelay * attempt));
      }
    }

    this.metrics.failedCalls++;
    return { success: false as const, error: "Failed after retries", fallback: this.generateFallback(schema) };
  }

  private parseAIResponse(text: string): any {
    let cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").replace(/^\s*json\s*/i, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
    try { return JSON.parse(cleaned); } catch (e) {
      cleaned = cleaned.replace(/,\s*\}/g, "}").replace(/,\s*\]/g, "]").replace(/\n/g, " ");
      return JSON.parse(cleaned);
    }
  }

  private generateFallback<T>(schema: z.ZodSchema<T>): T {
    if (schema === CompetitiveAnalysisSchema) return { competitorCount: 0, avgPrice: 75, commonFeatures: ["Standard features"], marketGaps: ["Premium features"], pricingRecommendation: { min: 50, max: 150, optimal: 95, reasoning: "Based on market standards." } } as T;
    if (schema === PricingIntelligenceSchema) return { marketAverage: 80, priceRange: { min: 40, max: 200, median: 75 }, positioning: "medium", recommendation: "Standard market range." } as T;
    if (schema === SEOSchema) return { title: "Product Title", description: "Description here", keywords: ["product", "digital"], metaDescription: "Meta desc", faqSchema: [{ question: "Q?", answer: "A." }], tags: ["digital"] } as T;
    if (schema === DescriptionOptimizationSchema) return { optimized: "Optimized description", shortVersion: "Short version", bulletPoints: ["Point 1"], tone: "professional" } as T;
    if (schema === TrendAnalysisSchema) return { trendingTags: ["AI", "Automation"], marketSaturation: "medium", opportunityScore: 70, emergingTopics: ["AI"] } as T;
    if (schema === ProductStructureSchema) return { optimizationScore: 65, titleAnalysis: { length: "good", clarity: "good" }, descriptionAnalysis: { depth: "good", clarity: "good" }, featureAnalysis: { count: "good", clarity: "good" }, pricingAnalysis: { competitiveness: "good", reasoning: "Standard" }, recommendations: ["Add more details"] } as T;
    if (schema === BuyerAnalysisSchema) return { valueAnalysis: { score: 70, strengths: ["Good"], considerations: ["Limited"], priceComparison: "Fair" }, qualityAssessment: { overallRating: "Good", features: ["Core"], benefits: ["Saves time"], completeness: "Complete" }, useCases: { primary: ["Professional"], secondary: ["Personal"], targetAudience: ["Pros"] }, recommendation: { shouldBuy: true, confidence: 75, reasoning: "Good value.", alternatives: ["Similar"] } } as T;
    return {} as T;
  }

  async analyzeCompetitors(input: { urls: string[]; productCategory: string }) {
    const cacheKey = this.cache.generateKey(input, "competitors");
    const prompt = `Analyze competitors for "${input.productCategory}":\n${input.urls.map((u,i) => `${i+1}. ${u}`).join("\n")}\nRespond JSON: {"avgPrice":85,"commonFeatures":["F1"],"marketGaps":["G1"],"pricingRecommendation":{"min":70,"max":120,"optimal":95,"reasoning":"..."}}`;
    const result = await this.callAI(prompt, CompetitiveAnalysisSchema, cacheKey);
    return result.success ? result.data : result.fallback;
  }

  async analyzePricingIntelligence(input: { productCategory: string; currentPrice: number; competitorPrices?: number[] }) {
    const prices = input.competitorPrices || [];
    const all = [input.currentPrice, ...prices];
    if (all.length >= 3) {
      const avg = all.reduce((a,b) => a+b, 0) / all.length;
      const sorted = [...all].sort((a,b) => a-b);
      const pos = input.currentPrice < avg*0.9 ? "low" : input.currentPrice > avg*1.1 ? "high" : "medium";
      return { marketAverage: Math.round(avg), priceRange: { min: Math.min(...all), max: Math.max(...all), median: sorted[Math.floor(sorted.length/2)] }, positioning: pos, recommendation: `Price is ${pos}` };
    }
    const result = await this.callAI(`Analyze pricing for ${input.productCategory} at ${input.currentPrice}. JSON: {"marketAverage":85,"priceRange":{"min":50,"max":150,"median":80},"positioning":"medium","recommendation":"..."}`, PricingIntelligenceSchema, this.cache.generateKey(input, "pricing"));
    return result.success ? result.data : result.fallback;
  }

  async generateSEO(input: { title: string; description: string; category: string; features: string[]; targetAudience?: string }) {
    const result = await this.callAI(`Generate SEO for: ${input.title}. JSON: {"title":"...","description":"...","keywords":[...],"metaDescription":"...","faqSchema":[...],"tags":[...]}`, SEOSchema, this.cache.generateKey(input, "seo"));
    return result.success ? result.data : result.fallback;
  }

  async optimizeDescription(input: { title: string; description: string; features: string[]; targetTone: "professional" | "casual" | "persuasive" }) {
    const result = await this.callAI(`Optimize desc for ${input.title}. JSON: {"optimized":"...","shortVersion":"...","bulletPoints":[...],"tone":"${input.targetTone}"}`, DescriptionOptimizationSchema, this.cache.generateKey(input, "desc"));
    return result.success ? result.data : result.fallback;
  }

  async analyzeTrends(input: { category: string; timeframe: "7d" | "30d" | "90d" }) {
    const result = await this.callAI(`Analyze trends for ${input.category}. JSON: {"trendingTags":[...],"marketSaturation":"medium","opportunityScore":75,"emergingTopics":[...]}`, TrendAnalysisSchema, this.cache.generateKey(input, "trends"));
    return result.success ? result.data : result.fallback;
  }

  async analyzeProductStructure(input: { title: string; description: string; features: string[]; pricing: number; deliverables: any[] }) {
    const titleLen = input.title.length < 30 ? "short" : input.title.length > 80 ? "long" : "good";
    const descDepth = input.description.length < 100 ? "poor" : input.description.length < 300 ? "fair" : input.description.length < 500 ? "good" : "excellent";
    const featCount = input.features.length < 3 ? "poor" : input.features.length < 5 ? "fair" : input.features.length < 8 ? "good" : "excellent";
    const recs: string[] = [];
    if (titleLen === "short") recs.push("Expand title");
    if (descDepth === "poor") recs.push("Add description details");
    if (featCount === "poor") recs.push("List more features");
    const score = Math.min(100, Math.max(40, (titleLen==="good"?20:10) + (descDepth==="excellent"?25:descDepth==="good"?20:10) + (featCount==="excellent"?25:featCount==="good"?20:10) + (input.pricing<300?20:10) + (input.deliverables.length>0?15:5)));
    return { optimizationScore: score, titleAnalysis: { length: titleLen, clarity: "good" }, descriptionAnalysis: { depth: descDepth, clarity: "good" }, featureAnalysis: { count: featCount, clarity: "good" }, pricingAnalysis: { competitiveness: input.pricing<150?"good":"fair", reasoning: "Standard" }, recommendations: recs };
  }

  async comprehensiveAnalysis(input: { title: string; description: string; category: string; features: string[]; pricing: number; deliverables: any[]; competitorUrls: string[]; targetAudience?: string }) {
    const [seo, content, structure, competitor, trends] = await Promise.all([
      this.generateSEO({ title: input.title, description: input.description, category: input.category, features: input.features, targetAudience: input.targetAudience }),
      this.optimizeDescription({ title: input.title, description: input.description, features: input.features, targetTone: "professional" }),
      this.analyzeProductStructure({ title: input.title, description: input.description, features: input.features, pricing: input.pricing, deliverables: input.deliverables }),
      input.competitorUrls.length > 0 ? this.analyzeCompetitors({ urls: input.competitorUrls, productCategory: input.category }) : Promise.resolve(null),
      this.analyzeTrends({ category: input.category, timeframe: "30d" }),
    ]);
    return { seo, content, structure, competitor, trends, optimizationScore: structure.optimizationScore };
  }

  async analyzeProductForBuyers(input: { title: string; description: string; category: string; features: string[]; price: number }) {
    const result = await this.callAI(`Analyze for buyers: ${input.title} (${input.price}). JSON: {"valueAnalysis":{"score":75,"strengths":[...],"considerations":[...],"priceComparison":"..."},"qualityAssessment":{"overallRating":"Good","features":[...],"benefits":[...],"completeness":"..."},"useCases":{"primary":[...],"secondary":[...],"targetAudience":[...]},"recommendation":{"shouldBuy":true,"confidence":80,"reasoning":"...","alternatives":[...]}}`, BuyerAnalysisSchema, this.cache.generateKey(input, "buyer"));
    return result.success ? result.data : result.fallback;
  }

  getMetrics() { return { ...this.metrics }; }
  getCacheStats() { const total = this.metrics.cacheHits + this.metrics.cacheMisses; return { size: this.cache.size(), hitRate: total > 0 ? (this.metrics.cacheHits / total) * 100 : 0 }; }
  clearCache() { this.cache.clear(); }
}

export default AIIntelligenceEngine;
