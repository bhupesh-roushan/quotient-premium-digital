"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema definitions
const SubscriptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    productId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Product" },
    planType: { type: String, enum: ["monthly", "yearly", "lifetime"], required: true },
    status: { type: String, enum: ["active", "cancelled", "expired"], default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    features: [{ type: String }],
    autoRenew: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const LicensingTierSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    licenseType: { type: String, enum: ["personal", "commercial", "enterprise", "custom"], required: true },
    features: [{ type: String, required: true }],
    limitations: [{ type: String }],
    duration: { type: String }, // e.g., "perpetual", "1-year", "subscription"
    supportLevel: { type: String, enum: ["basic", "standard", "premium", "enterprise"], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const AIPromptPackSchema = new mongoose_1.Schema({
    categories: { type: [String], default: [] },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: false },
    supportedModels: { type: [String], default: [] },
    promptCount: { type: Number, required: false, min: 1 },
    usageInstructions: { type: String, required: false },
    format: { type: String, enum: ["json", "markdown", "text"], required: false },
    downloadType: { type: String, enum: ["structured", "individual"], default: "individual" },
    prompts: [{ label: { type: String, default: "" }, content: { type: String, default: "" } }],
});
const TemplateSchema = new mongoose_1.Schema({
    templateType: { type: String, enum: ["notion", "resume", "ui-kit", "dashboard", "figma", "productivity"], required: false },
    compatibility: [{ type: [String], required: false }],
    features: [{ type: [String], required: false }],
    customizationLevel: { type: String, enum: ["low", "medium", "high"], required: false },
    includesAssets: { type: Boolean, default: false },
    componentDeliverables: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            description: { type: String, required: true },
            componentType: { type: String, required: true },
            framework: { type: String, required: true },
            language: { type: String, required: true },
            codeFiles: [{
                    filename: { type: String, required: true },
                    content: { type: String, required: true },
                    language: { type: String, required: true },
                }],
            previewUrl: { type: String },
            dependencies: [{ type: String }],
            createdAt: { type: Date, default: Date.now },
        }],
});
const CodeTemplateSchema = new mongoose_1.Schema({
    framework: { type: String, enum: ["react", "vue", "angular", "javascript", "typescript", "css", "html"], required: false },
    language: { type: String, enum: ["javascript", "typescript", "html", "css", "jsx", "tsx", "vue", "scss"], required: false },
    componentType: { type: String, enum: ["component", "page", "hook", "utility", "template", "layout"], required: false },
    dependencies: [{ type: [String], required: false }],
    hasLivePreview: { type: Boolean, default: false },
    codeFiles: [{
            filename: { type: String, required: true },
            content: { type: String, required: true },
            language: { type: String, required: true },
        }],
    previewUrl: { type: String },
    sandboxEnabled: { type: Boolean, default: true },
});
const DeveloperBoilerplateSchema = new mongoose_1.Schema({
    techStack: [{ type: [String], required: false }],
    architecture: { type: String, enum: ["mvc", "spa", "fullstack", "microservices", "serverless"], required: false },
    includesAuth: { type: Boolean, required: false },
    includesDatabase: { type: Boolean, required: false },
    includesTesting: { type: Boolean, required: false },
    deploymentReady: { type: Boolean, required: false },
    documentation: { type: Boolean, required: false },
    starterType: { type: String, enum: ["mern", "nextjs", "express", "fastapi", "django"], required: false },
});
const WorkflowSystemSchema = new mongoose_1.Schema({
    workflowType: { type: String, enum: ["automation", "productivity", "business", "ai", "integration"], required: false },
    stepsCount: { type: Number, required: false, min: 1 },
    tools: [{ type: [String], required: false }],
    integrationLevel: { type: String, enum: ["basic", "intermediate", "advanced"], required: false },
    timeToImplement: { type: String, required: false },
    platforms: [{ type: [String], required: false }],
});
const AutomationGuideSchema = new mongoose_1.Schema({
    guideType: { type: String, enum: ["automation", "productivity", "business", "development"], required: false },
    complexity: { type: String, enum: ["beginner", "intermediate", "advanced"], required: false },
    prerequisites: [{ type: [String], required: false }],
    toolsRequired: [{ type: [String], required: false }],
    estimatedTime: { type: String, required: false },
    outcomes: [{ type: [String], required: false }],
    includesTemplates: { type: Boolean, required: false },
});
const ProductivityFrameworkSchema = new mongoose_1.Schema({
    frameworkType: { type: String, enum: ["productivity", "project-management", "time-management", "team-collaboration"], required: false },
    methodology: { type: String, required: false },
    components: [{ type: [String], required: false }],
    integrations: [{ type: [String], required: false }],
    scalability: { type: String, enum: ["personal", "team", "enterprise"], required: false },
    includesTemplates: { type: Boolean, required: false },
    includesWorkflows: { type: Boolean, required: false },
});
const ProductDeliverableSchema = new mongoose_1.Schema({
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    kind: {
        type: String,
        enum: ["link", "file", "code", "structured"],
        default: "link",
    },
    filename: { type: String },
});
const ProductPageSectionSchema = new mongoose_1.Schema({
    heading: { type: String, required: true, trim: true },
    bullets: [{ type: String, trim: true }],
});
const ProductPricingTierSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    popular: { type: Boolean, default: false },
    license: { type: String, enum: ["personal", "commercial", "enterprise", "custom"], default: "personal" },
});
const SEODataSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    keywords: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    faqSchema: [{
            question: { type: String, required: true },
            answer: { type: String, required: true },
        }],
});
const AIAnalysisSchema = new mongoose_1.Schema({
    optimizationScore: { type: Number, min: 0, max: 100 },
    pricingRecommendation: {
        min: { type: Number },
        max: { type: Number },
        optimal: { type: Number },
        reasoning: { type: String },
    },
    competitorAnalysis: {
        competitorCount: { type: Number },
        avgPrice: { type: Number },
        commonFeatures: [{ type: String }],
        marketGaps: [{ type: String }],
    },
    seoOptimizations: {
        title: { type: String },
        description: { type: String },
        keywords: [{ type: String }],
    },
    trendData: {
        trendingTags: [{ type: String }],
        marketSaturation: { type: String, enum: ["low", "medium", "high"] },
        opportunityScore: { type: Number, min: 0, max: 100 },
    },
    lastAnalyzed: { type: String },
});
const ProductSchema = new mongoose_1.Schema({
    creatorId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
    visibility: { type: String, enum: ["draft", "published"], required: true },
    slug: { type: String, required: true, trim: true },
    coverImageAssetId: { type: mongoose_1.Schema.Types.ObjectId, default: null },
    // Product category
    category: {
        type: String,
        enum: [
            "ai-prompt-pack",
            "notion-template",
            "resume-template",
            "ui-kit",
            "figma-assets",
            "productivity-dashboard",
            "dev-boilerplate",
            "mern-starter",
            "auth-system",
            "saas-starter",
            "api-scaffold",
            "workflow-system",
            "automation-pipeline",
            "ai-productivity",
            "business-guide",
            "automation-guide",
            "productivity-framework",
            "react-template",
            "vue-template",
            "angular-template",
            "javascript-component",
            "typescript-component",
            "css-template",
            "html-template"
        ],
        required: true
    },
    // Product metadata based on category
    aiPromptPack: AIPromptPackSchema,
    template: TemplateSchema,
    codeTemplate: CodeTemplateSchema,
    developerBoilerplate: DeveloperBoilerplateSchema,
    workflowSystem: WorkflowSystemSchema,
    automationGuide: AutomationGuideSchema,
    productivityFramework: ProductivityFrameworkSchema,
    // Common metadata
    deliverables: { type: [ProductDeliverableSchema], default: [] },
    installInstructions: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    license: { type: String, enum: ["Personal Use", "Commercial Use", "Enterprise", "Custom"], default: "Personal Use" },
    // SEO and AI optimization
    seo: SEODataSchema,
    aiAnalysis: AIAnalysisSchema,
    // Page content
    page: {
        sections: { type: [ProductPageSectionSchema], default: [] },
        pricingTiers: { type: [ProductPricingTierSchema], default: [] },
    },
    // Analytics and stats
    stats: {
        viewCount: { type: Number, default: 0 },
        soldCount: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
    },
    // Subscription and licensing
    subscriptions: { type: [SubscriptionSchema], default: [] },
    licensingTiers: { type: [LicensingTierSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Indexes
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ visibility: 1 });
ProductSchema.index({ creatorId: 1 });
exports.Product = mongoose_1.default.model("Product", ProductSchema);
