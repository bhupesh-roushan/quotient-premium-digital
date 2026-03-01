import mongoose, { Types, Schema } from "mongoose";

export type ProductVisibility = "draft" | "published";

// AI-Powered Digital Creator Marketplace Product Categories
export type ProductCategory =
  | "ai-prompt-pack"
  | "notion-template"
  | "resume-template"
  | "ui-kit"
  | "figma-assets"
  | "productivity-dashboard"
  | "dev-boilerplate"
  | "mern-starter"
  | "auth-system"
  | "saas-starter"
  | "api-scaffold"
  | "workflow-system"
  | "automation-pipeline"
  | "ai-productivity"
  | "business-guide"
  | "automation-guide"
  | "productivity-framework"
  | "react-template"
  | "vue-template"
  | "angular-template"
  | "javascript-component"
  | "typescript-component"
  | "css-template"
  | "html-template";

// AI Prompt Pack specific metadata
export type AIPromptPackMetadata = {
  categories: string[]; // marketing, coding, art, writing, business, productivity
  difficulty: "beginner" | "intermediate" | "advanced";
  supportedModels: string[]; // ChatGPT, Claude, Midjourney, DALL-E, etc.
  promptCount: number;
  usageInstructions: string;
  format: "json" | "markdown" | "text";
  downloadType: "structured" | "individual";
  prompts: Array<{ label: string; content: string }>;
};

// Template specific metadata
export type TemplateMetadata = {
  templateType: "notion" | "resume" | "ui-kit" | "dashboard" | "figma" | "productivity";
  compatibility: string[]; // Notion 2.0, Figma, React, etc.
  features: string[];
  customizationLevel: "low" | "medium" | "high";
  includesAssets: boolean;
  componentDeliverables?: Array<{
    id: string;
    name: string;
    description: string;
    componentType: string;
    framework: string;
    language: string;
    codeFiles: Array<{
      filename: string;
      content: string;
      language: string;
    }>;
    previewUrl?: string;
    dependencies: string[];
    createdAt: Date;
  }>;
};

// Code Template specific metadata
export type CodeTemplateMetadata = {
  framework: "react" | "vue" | "angular" | "javascript" | "typescript" | "css" | "html";
  language: "javascript" | "typescript" | "html" | "css" | "jsx" | "tsx" | "vue" | "scss";
  componentType: "component" | "page" | "hook" | "utility" | "template" | "layout";
  dependencies: string[]; // npm packages
  hasLivePreview: boolean;
  codeFiles: Array<{
    filename: string;
    content: string;
    language: string;
  }>;
  previewUrl?: string;
  sandboxEnabled: boolean;
};

// Developer Boilerplate specific metadata
export type DeveloperBoilerplateMetadata = {
  techStack: string[]; // React, Node, MongoDB, Express, etc.
  architecture: "mvc" | "spa" | "fullstack" | "microservices" | "serverless";
  includesAuth: boolean;
  includesDatabase: boolean;
  includesTesting: boolean;
  deploymentReady: boolean;
  documentation: boolean;
  starterType: "mern" | "nextjs" | "express" | "fastapi" | "django";
};

// Workflow System specific metadata
export type WorkflowSystemMetadata = {
  workflowType: "automation" | "productivity" | "business" | "ai" | "integration";
  stepsCount: number;
  tools: string[]; // Zapier, Make, n8n, custom scripts, APIs
  integrationLevel: "basic" | "intermediate" | "advanced";
  timeToImplement: string; // 30min, 2hours, 1day, 1week
  platforms: string[]; // Web, Mobile, Desktop
};

// Automation Guide specific metadata
export type AutomationGuideMetadata = {
  guideType: "automation" | "productivity" | "business" | "development";
  complexity: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  toolsRequired: string[];
  estimatedTime: string;
  outcomes: string[];
  includesTemplates: boolean;
};

// Productivity Framework specific metadata
export type ProductivityFrameworkMetadata = {
  frameworkType: "productivity" | "project-management" | "time-management" | "team-collaboration";
  methodology: string;
  components: string[];
  integrations: string[];
  scalability: "personal" | "team" | "enterprise";
  includesTemplates: boolean;
  includesWorkflows: boolean;
};

// SEO and AI optimization metadata
export type SEOData = {
  title: string;
  description: string;
  keywords: string[];
  faqSchema?: { question: string; answer: string }[];
  tags: string[];
};

// AI Analysis Results
export type AIAnalysis = {
  optimizationScore: number; // 0-100
  pricingRecommendation: {
    min: number;
    max: number;
    optimal: number;
    reasoning: string;
  };
  competitorAnalysis: {
    competitorCount: number;
    avgPrice: number;
    commonFeatures: string[];
    marketGaps: string[];
  };
  seoOptimizations: {
    title: string;
    description: string;
    keywords: string[];
  };
  trendData: {
    trendingTags: string[];
    marketSaturation: "low" | "medium" | "high";
    opportunityScore: number;
  };
  lastAnalyzed: string;
};

export type ProductPageSection = {
  heading: string;
  bullets: string[];
};

export type ProductPricingTier = {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  license: "personal" | "commercial" | "enterprise" | "custom";
};

export type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency?: "INR" | "USD" | "EUR";
  visibility: ProductVisibility;
  slug: string;
  category: ProductCategory;
  
  // Product metadata based on category
  aiPromptPack?: AIPromptPackMetadata;
  template?: TemplateMetadata;
  codeTemplate?: CodeTemplateMetadata;
  developerBoilerplate?: DeveloperBoilerplateMetadata;
  workflowSystem?: WorkflowSystemMetadata;
  automationGuide?: AutomationGuideMetadata;
  productivityFramework?: ProductivityFrameworkMetadata;
  
  // Common metadata
  deliverables: Array<{
    label: string;
    kind: "link" | "file" | "code" | "structured";
    url?: string;
    filename?: string;
  }>;
  installInstructions?: string;
  requirements?: string[];
  license: "Personal Use" | "Commercial Use" | "Enterprise" | "Custom";
  
  // SEO and AI optimization
  seo: SEOData;
  aiAnalysis?: AIAnalysis;
  
  // Page content
  page: {
    sections: ProductPageSection[];
    pricingTiers: ProductPricingTier[];
  };
  
  // Analytics and stats
  stats: {
    viewCount: number;
    soldCount: number;
    revenue: number;
    averageRating: number;
    reviewCount: number;
    conversionRate: number;
  };
  
  createdAt: string;
  updatedAt: string;
};

export type ImageAsset = {
  _id: string;
  assetType: "preview" | "downloadable";

  cloudinary?: {
    secureUrl?: string;
    publicId?: string;
    folder?: string;
    assetId?: string;
  };

  meta?: {
    filename?: string;
    contentType?: string;
    sizeBytes?: number;
    width?: number;
    height?: number;
  };

  source?: {
    sourceUrl?: string;
    sourcePageUrl?: string;
  };

  orderIndex?: number;

  createdAt?: string;
  updatedAt?: string;
};

export type SearchResult = {
  url: string;
  title?: string;
  description?: string;
};

export type Candidate = {
  url: string;
  sourcePageUrl?: string;
};

export type ScanPage = {
  url: string;
  title?: string;
  description?: string;
};

export type FirecrawlSearchRes = ApiOk<{ results: SearchResult[] }> | ApiErr;
export type FirecrawlScrapeRes =
  | ApiOk<{
      candidates?: Candidate[];
      extracted?: {
        summary?: string;
        sections?: ProductPageSection[];
        pricingTiers?: ProductPricingTier[];
      };
    }>
  | ApiErr;

export type IngestRes =
  | ApiOk<{
      created: ImageAsset[];
      failed: Array<{ url: string; reason: string }>;
    }>
  | ApiErr;

export type ApiOk<T> = { ok: true } & T;
export type ApiErr = { ok: false; error?: string };

export type ProductRes = ApiOk<{ product: Product }> | ApiErr;
export type AssetsRes = ApiOk<{ assets: ImageAsset[] }> | ApiErr;

// ProductDoc type for Mongoose
export type ProductDoc = {
  creatorId: Types.ObjectId;

  title: string;
  description: string;
  price: number;
  currency: "INR";
  visibility: ProductVisibility;
  slug: string;

  coverImageAssetId: Types.ObjectId | null;

  category: ProductCategory;

  // Product metadata based on category
  aiPromptPack?: AIPromptPackMetadata;
  template?: TemplateMetadata;
  codeTemplate?: CodeTemplateMetadata;
  developerBoilerplate?: DeveloperBoilerplateMetadata;
  workflowSystem?: WorkflowSystemMetadata;
  automationGuide?: AutomationGuideMetadata;
  productivityFramework?: ProductivityFrameworkMetadata;

  // Common metadata
  deliverables: Array<{
    label: string;
    kind: "link" | "file" | "code" | "structured";
    url: string;
    filename?: string;
  }>;
  installInstructions: string;
  requirements: string[];
  license: "Personal Use" | "Commercial Use" | "Enterprise" | "Custom";

  // SEO and AI optimization
  seo: SEOData;
  aiAnalysis?: AIAnalysis;

  // Page content
  page: {
    sections: ProductPageSection[];
    pricingTiers: ProductPricingTier[];
  };

  // Analytics and stats
  stats: {
    viewCount: number;
    soldCount: number;
    revenue: number;
    averageRating: number;
    reviewCount: number;
    conversionRate: number;
  },

  // Subscription and licensing
  subscriptions?: Array<{
    _id: string;
    userId: string;
    productId: string;
    planType: "monthly" | "yearly" | "lifetime";
    status: "active" | "cancelled" | "expired";
    startDate: string;
    endDate?: string;
    price: number;
    currency: string;
    features: string[];
    autoRenew: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  
  // Licensing tiers for products
  licensingTiers?: Array<{
    _id: string;
    productId: string;
    name: string;
    price: number;
    currency: string;
    licenseType: "personal" | "commercial" | "enterprise" | "custom";
    features: string[];
    limitations?: string[];
    duration?: string; // e.g., "perpetual", "1-year", "subscription"
    supportLevel: "basic" | "standard" | "premium" | "enterprise";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
};

// Schema definitions
const SubscriptionSchema = new Schema<any>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
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

const LicensingTierSchema = new Schema<any>({
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
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

const AIPromptPackSchema = new Schema<AIPromptPackMetadata>({
  categories: { type: [String], default: [] },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: false },
  supportedModels: { type: [String], default: [] },
  promptCount: { type: Number, required: false, min: 1 },
  usageInstructions: { type: String, required: false },
  format: { type: String, enum: ["json", "markdown", "text"], required: false },
  downloadType: { type: String, enum: ["structured", "individual"], default: "individual" },
  prompts: [{ label: { type: String, default: "" }, content: { type: String, default: "" } }],
});

const TemplateSchema = new Schema<TemplateMetadata>({
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

const CodeTemplateSchema = new Schema<CodeTemplateMetadata>({
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

const DeveloperBoilerplateSchema = new Schema<DeveloperBoilerplateMetadata>({
  techStack: [{ type: [String], required: false }],
  architecture: { type: String, enum: ["mvc", "spa", "fullstack", "microservices", "serverless"], required: false },
  includesAuth: { type: Boolean, required: false },
  includesDatabase: { type: Boolean, required: false },
  includesTesting: { type: Boolean, required: false },
  deploymentReady: { type: Boolean, required: false },
  documentation: { type: Boolean, required: false },
  starterType: { type: String, enum: ["mern", "nextjs", "express", "fastapi", "django"], required: false },
});

const WorkflowSystemSchema = new Schema<WorkflowSystemMetadata>({
  workflowType: { type: String, enum: ["automation", "productivity", "business", "ai", "integration"], required: false },
  stepsCount: { type: Number, required: false, min: 1 },
  tools: [{ type: [String], required: false }],
  integrationLevel: { type: String, enum: ["basic", "intermediate", "advanced"], required: false },
  timeToImplement: { type: String, required: false },
  platforms: [{ type: [String], required: false }],
});

const AutomationGuideSchema = new Schema<AutomationGuideMetadata>({
  guideType: { type: String, enum: ["automation", "productivity", "business", "development"], required: false },
  complexity: { type: String, enum: ["beginner", "intermediate", "advanced"], required: false },
  prerequisites: [{ type: [String], required: false }],
  toolsRequired: [{ type: [String], required: false }],
  estimatedTime: { type: String, required: false },
  outcomes: [{ type: [String], required: false }],
  includesTemplates: { type: Boolean, required: false },
});

const ProductivityFrameworkSchema = new Schema<ProductivityFrameworkMetadata>({
  frameworkType: { type: String, enum: ["productivity", "project-management", "time-management", "team-collaboration"], required: false },
  methodology: { type: String, required: false },
  components: [{ type: [String], required: false }],
  integrations: [{ type: [String], required: false }],
  scalability: { type: String, enum: ["personal", "team", "enterprise"], required: false },
  includesTemplates: { type: Boolean, required: false },
  includesWorkflows: { type: Boolean, required: false },
});

const ProductDeliverableSchema = new Schema({
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  kind: {
    type: String,
    enum: ["link", "file", "code", "structured"],
    default: "link",
  },
  filename: { type: String },
});

const ProductPageSectionSchema = new Schema<ProductPageSection>({
  heading: { type: String, required: true, trim: true },
  bullets: [{ type: String, trim: true }],
});

const ProductPricingTierSchema = new Schema<ProductPricingTier>({
  name: { type: String, required: true, trim: true },
  price: { type: String, required: true, trim: true },
  features: [{ type: String, trim: true }],
  popular: { type: Boolean, default: false },
  license: { type: String, enum: ["personal", "commercial", "enterprise", "custom"], default: "personal" },
});

const SEODataSchema = new Schema<SEOData>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  keywords: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  faqSchema: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
  }],
});

const AIAnalysisSchema = new Schema<AIAnalysis>({
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

const ProductSchema = new Schema<ProductDoc>({
  creatorId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
  visibility: { type: String, enum: ["draft", "published"], required: true },
  slug: { type: String, required: true, trim: true },
  coverImageAssetId: { type: Schema.Types.ObjectId, default: null },
  
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

export const Product = mongoose.model<ProductDoc>("Product", ProductSchema);
