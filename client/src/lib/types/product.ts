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
  | "productivity-framework";

// AI Prompt Pack specific metadata
export type AIPromptPackMetadata = {
  categories: string[]; // marketing, coding, art, writing, business, productivity
  difficulty: "beginner" | "intermediate" | "advanced";
  supportedModels: string[]; // ChatGPT, Claude, Midjourney, DALL-E, etc.
  promptCount: number;
  usageInstructions: string;
  format: "json" | "markdown" | "text";
  downloadType: "structured" | "individual";
};

// Template specific metadata
export type TemplateMetadata = {
  templateType: "notion" | "resume" | "ui-kit" | "dashboard" | "figma" | "productivity";
  compatibility: string[]; // Notion 2.0, Figma, React, etc.
  features: string[];
  customizationLevel: "low" | "medium" | "high";
  includesAssets: boolean;
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

// Subscription and licensing types
export type Subscription = {
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
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
};

export type LicensingTier = {
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
  coverImageAssetId?: string | null;
  
  // Product metadata based on category
  aiPromptPack?: AIPromptPackMetadata;
  template?: TemplateMetadata;
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
  
  // Subscription and licensing
  subscriptions?: Subscription[];
  licensingTiers?: LicensingTier[];
  
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
