"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AssetsRes,
  ImageAsset,
  Product,
  ProductRes,
} from "@/lib/types/product";
import { useState, useEffect } from "react";
import AssetsGrid from "./asset-grid";
import { apiClient } from "@/lib/api/client";
import ImageUpload from "./image-upload";
import GoogleImageSearch from "./google-image-search";
import CodeEditor from "@/components/ui/code-editor";
import DeliverablesManager, { ComponentDeliverable } from "@/components/ui/deliverables-manager";
import { useRouter } from "next/navigation";
import { AIDashboard } from "@/components/creator/dashboard/ai-dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Code2,
  FileCode,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  Settings,
  Eye,
  Box,
  Wand2,
  FileText,
  Palette,
  Figma,
  BarChart3,
  Bot,
  Zap,
  Rocket,
  Lock,
  Briefcase,
  Plug,
  RefreshCw,
  Brain,
  BookOpen,
  TrendingUp,
  Atom,
  Circle,
  Triangle,
  FileType,
  Code,
  Upload,
  Save,
  Check,
  ChevronDown,
  Loader2,
  Trash2,
  Play,
  Database,
  Clock,
  Globe,
  Wrench,
  GitBranch,
  Users,
  ShieldCheck,
  TestTube2,
} from "lucide-react";

const AI_PLATFORMS = [
  { value: "chatgpt", label: "ChatGPT", icon: "🤖" },
  { value: "claude", label: "Claude", icon: "🧠" },
  { value: "gemini", label: "Gemini", icon: "✨" },
  { value: "midjourney", label: "Midjourney", icon: "🎨" },
  { value: "dall-e", label: "DALL·E", icon: "🖼️" },
  { value: "stable-diffusion", label: "Stable Diffusion", icon: "🌊" },
  { value: "llama", label: "Llama", icon: "🦙" },
  { value: "mistral", label: "Mistral", icon: "💨" },
  { value: "perplexity", label: "Perplexity", icon: "🔍" },
  { value: "grok", label: "Grok", icon: "⚡" },
];

const AI_USE_CASES = [
  { value: "marketing", label: "Marketing" },
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "art", label: "Art & Design" },
  { value: "business", label: "Business" },
  { value: "productivity", label: "Productivity" },
  { value: "sales", label: "Sales" },
  { value: "education", label: "Education" },
  { value: "seo", label: "SEO" },
  { value: "social-media", label: "Social Media" },
];

interface CodeFile {
  filename: string;
  content: string;
  language: string;
}

type PatchProductBody = {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  installInstructions?: string;
  template?: {
    kind?: string;
    tool?: string;
    deliverables?: Array<{ label: string; url: string; kind: "link" | "file" | "code" }>;
    componentDeliverables?: ComponentDeliverable[];
  };
  codeFiles?: CodeFile[];
  framework?: string;
  language?: string;
  componentType?: string;
  dependencies?: string[];
  hasLivePreview?: boolean;
  sandboxEnabled?: boolean;
  tags?: string[];
};

// Categories with icons - using Lucide icon names
const categories = [
  { value: "notion-template", label: "Notion Template", iconName: "FileText" },
  { value: "resume-template", label: "Resume Template", iconName: "FileText" },
  { value: "ui-kit", label: "UI Kit", iconName: "Palette" },
  { value: "figma-assets", label: "Figma Assets", iconName: "Figma" },
  { value: "productivity-dashboard", label: "Productivity Dashboard", iconName: "BarChart3" },
  { value: "ai-prompt-pack", label: "AI Prompt Pack", iconName: "Bot" },
  { value: "dev-boilerplate", label: "Developer Boilerplate", iconName: "Zap" },
  { value: "mern-starter", label: "MERN Starter", iconName: "Rocket" },
  { value: "auth-system", label: "Auth System", iconName: "Lock" },
  { value: "saas-starter", label: "SaaS Starter", iconName: "Briefcase" },
  { value: "api-scaffold", label: "API Scaffold", iconName: "Plug" },
  { value: "workflow-system", label: "Workflow System", iconName: "Settings" },
  { value: "automation-pipeline", label: "Automation Pipeline", iconName: "RefreshCw" },
  { value: "ai-productivity", label: "AI Productivity", iconName: "Brain" },
  { value: "business-guide", label: "Business Guide", iconName: "BookOpen" },
  { value: "automation-guide", label: "Automation Guide", iconName: "Bot" },
  { value: "productivity-framework", label: "Productivity Framework", iconName: "TrendingUp" },
  { value: "react-template", label: "React Template", iconName: "Atom" },
  { value: "vue-template", label: "Vue Template", iconName: "Circle" },
  { value: "angular-template", label: "Angular Template", iconName: "Triangle" },
  { value: "javascript-component", label: "JavaScript Component", iconName: "FileCode" },
  { value: "typescript-component", label: "TypeScript Component", iconName: "FileType" },
  { value: "css-template", label: "CSS Template", iconName: "Palette" },
  { value: "html-template", label: "HTML Template", iconName: "Code" },
];

// Icon mapping for categories
const iconComponents: Record<string, React.ElementType> = {
  FileText,
  Palette,
  Figma,
  BarChart3,
  Bot,
  Zap,
  Rocket,
  Lock,
  Briefcase,
  Plug,
  RefreshCw,
  Brain,
  BookOpen,
  TrendingUp,
  Atom,
  Circle,
  Triangle,
  FileType,
  Code,
};

function getCategoryIcon(iconName: string) {
  return iconComponents[iconName] || Package;
}

function EditPanelRedesigned({
  productId,
  product,
  assets,
  coverUrl,
  onProductChange,
  onAssetsChange,
  onRefresh,
}: {
  productId: string;
  product: Product;
  assets: ImageAsset[];
  coverUrl: string | null;
  onProductChange: (p: Product) => void;
  onAssetsChange: (a: ImageAsset[]) => void;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string>(product.title);
  const [description, setDescription] = useState<string>(
    (product as unknown as { description?: string }).description ?? ""
  );
  const [price, setPrice] = useState<number>(product.price);
  const [templateKind, setTemplateKind] = useState<string>(
    product?.category || product?.template?.templateType || "generic"
  );
  const [templateTool, setTemplateTool] = useState<string>(
    (product as any)?.codeTemplate?.framework || ""
  );
  const [installInstructions, setInstallInstructions] = useState<string>(
    product?.installInstructions || ""
  );
  const [deliverables, setDeliverables] = useState<
    Array<{ label: string; url: string; kind: "link" | "file" | "code" }>
  >([]);

  // Code template specific states
  const [framework, setFramework] = useState("react");
  const [language, setLanguage] = useState("typescript");
  const [componentType, setComponentType] = useState("component");
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [dependencyInput, setDependencyInput] = useState("");
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [activeCodeFile, setActiveCodeFile] = useState(0);
  const [hasLivePreview, setHasLivePreview] = useState(true);
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [currentTab, setCurrentTab] = useState("details");
  const [componentDeliverables, setComponentDeliverables] = useState<ComponentDeliverable[]>([]);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tags, setTags] = useState<string[]>(
    () => (product as any)?.tags ?? []
  );
  const [tagInput, setTagInput] = useState("");

  const addTag = (val: string) => {
    const cleaned = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (cleaned && !tags.includes(cleaned)) setTags(prev => [...prev, cleaned]);
    setTagInput("");
  };

  // AI Prompt Pack specific
  const [supportedModels, setSupportedModels] = useState<string[]>(
    () => (product as any)?.aiPromptPack?.supportedModels ?? []
  );
  const [useCases, setUseCases] = useState<string[]>(
    () => (product as any)?.aiPromptPack?.categories ?? []
  );
  const [prompts, setPrompts] = useState<Array<{ label: string; content: string }>>(
    () => (product as any)?.aiPromptPack?.prompts ?? []
  );
  const [promptRunnerText, setPromptRunnerText] = useState("");
  const [promptContext, setPromptContext] = useState("");
  const [promptRunnerOutput, setPromptRunnerOutput] = useState("");
  const [runningPrompt, setRunningPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");

  const isAIPromptPack = templateKind === "ai-prompt-pack";
  const isTemplate = ["notion-template", "resume-template", "ui-kit", "figma-assets", "productivity-dashboard"].includes(templateKind ?? "");
  const isDevBoilerplate = ["dev-boilerplate", "mern-starter", "auth-system", "saas-starter", "api-scaffold",
    "react-template", "vue-template", "angular-template", "javascript-component",
    "typescript-component", "css-template", "html-template"].includes(templateKind ?? "");
  const isWorkflow = ["workflow-system", "automation-pipeline", "ai-productivity"].includes(templateKind ?? "");
  const isGuide = ["business-guide", "automation-guide"].includes(templateKind ?? "");
  const isFramework = templateKind === "productivity-framework";

  // Template metadata state
  const [templateCompatibility, setTemplateCompatibility] = useState<string[]>(() => (product as any)?.template?.compatibility ?? []);
  const [templateFeatures, setTemplateFeatures] = useState<string[]>(() => (product as any)?.template?.features ?? []);
  const [templateCustomization, setTemplateCustomization] = useState<"low" | "medium" | "high">(() => (product as any)?.template?.customizationLevel ?? "medium");
  const [templateIncludesAssets, setTemplateIncludesAssets] = useState<boolean>(() => !!(product as any)?.template?.includesAssets);
  const [compatibilityInput, setCompatibilityInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  // Developer boilerplate state
  const [techStack, setTechStack] = useState<string[]>(() => (product as any)?.developerBoilerplate?.techStack ?? []);
  const [architecture, setArchitecture] = useState<string>(() => (product as any)?.developerBoilerplate?.architecture ?? "");
  const [devIncludesAuth, setDevIncludesAuth] = useState<boolean>(() => !!(product as any)?.developerBoilerplate?.includesAuth);
  const [devIncludesDatabase, setDevIncludesDatabase] = useState<boolean>(() => !!(product as any)?.developerBoilerplate?.includesDatabase);
  const [devIncludesTesting, setDevIncludesTesting] = useState<boolean>(() => !!(product as any)?.developerBoilerplate?.includesTesting);
  const [devDeploymentReady, setDevDeploymentReady] = useState<boolean>(() => !!(product as any)?.developerBoilerplate?.deploymentReady);
  const [devDocumentation, setDevDocumentation] = useState<boolean>(() => !!(product as any)?.developerBoilerplate?.documentation);
  const [techStackInput, setTechStackInput] = useState("");

  // Workflow metadata state
  const [workflowType, setWorkflowType] = useState<string>(() => (product as any)?.workflowSystem?.workflowType ?? "");
  const [workflowSteps, setWorkflowSteps] = useState<number>(() => (product as any)?.workflowSystem?.stepsCount ?? 0);
  const [workflowTools, setWorkflowTools] = useState<string[]>(() => (product as any)?.workflowSystem?.tools ?? []);
  const [integrationLevel, setIntegrationLevel] = useState<string>(() => (product as any)?.workflowSystem?.integrationLevel ?? "basic");
  const [timeToImplement, setTimeToImplement] = useState<string>(() => (product as any)?.workflowSystem?.timeToImplement ?? "");
  const [workflowPlatforms, setWorkflowPlatforms] = useState<string[]>(() => (product as any)?.workflowSystem?.platforms ?? []);
  const [workflowToolInput, setWorkflowToolInput] = useState("");
  const [platformInput, setPlatformInput] = useState("");

  // Guide metadata state
  const [guideComplexity, setGuideComplexity] = useState<"beginner" | "intermediate" | "advanced">(() => (product as any)?.automationGuide?.complexity ?? "beginner");
  const [guidePrerequisites, setGuidePrerequisites] = useState<string[]>(() => (product as any)?.automationGuide?.prerequisites ?? []);
  const [guideTools, setGuideTools] = useState<string[]>(() => (product as any)?.automationGuide?.toolsRequired ?? []);
  const [guideTime, setGuideTime] = useState<string>(() => (product as any)?.automationGuide?.estimatedTime ?? "");
  const [guideOutcomes, setGuideOutcomes] = useState<string[]>(() => (product as any)?.automationGuide?.outcomes ?? []);
  const [guideIncludesTemplates, setGuideIncludesTemplates] = useState<boolean>(() => !!(product as any)?.automationGuide?.includesTemplates);
  const [prereqInput, setPrereqInput] = useState("");
  const [guideToolInput, setGuideToolInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  // Productivity framework state
  const [frameworkMethodology, setFrameworkMethodology] = useState<string>(() => (product as any)?.productivityFramework?.methodology ?? "");
  const [frameworkComponents, setFrameworkComponents] = useState<string[]>(() => (product as any)?.productivityFramework?.components ?? []);
  const [frameworkIntegrations, setFrameworkIntegrations] = useState<string[]>(() => (product as any)?.productivityFramework?.integrations ?? []);
  const [frameworkScalability, setFrameworkScalability] = useState<string>(() => (product as any)?.productivityFramework?.scalability ?? "personal");
  const [frameworkIncludesTemplates, setFrameworkIncludesTemplates] = useState<boolean>(() => !!(product as any)?.productivityFramework?.includesTemplates);
  const [frameworkIncludesWorkflows, setFrameworkIncludesWorkflows] = useState<boolean>(() => !!(product as any)?.productivityFramework?.includesWorkflows);
  const [frameworkComponentInput, setFrameworkComponentInput] = useState("");
  const [frameworkIntegrationInput, setFrameworkIntegrationInput] = useState("");

  const toggleModel = (val: string) =>
    setSupportedModels(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const toggleUseCase = (val: string) =>
    setUseCases(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const runPrompt = async () => {
    if (!promptRunnerText.trim()) return;
    setRunningPrompt(true);
    setPromptRunnerOutput("");
    setPromptError("");
    try {
      const res = await apiClient.post("/api/prompt-runner", {
        prompt: promptRunnerText,
        context: promptContext || undefined,
      });
      if (res?.data?.ok) {
        setPromptRunnerOutput(res.data.output);
      } else {
        setPromptError(res?.data?.error || "Failed to run prompt");
      }
    } catch (err: any) {
      setPromptError(err?.response?.data?.error || "Network error");
    } finally {
      setRunningPrompt(false);
    }
  };

  const router = useRouter();

  // Check if this is a code template
  const isCodeTemplate = templateKind?.includes("-template") || templateKind?.includes("-component") || 
                        templateTool === "react" || templateTool === "nextjs" || templateTool === "vue" ||
                        templateKind === "react_component" || templateKind === "dev_boilerplate";

  // Sync AI prompt pack & tags state when product prop changes (e.g. after save)
  useEffect(() => {
    setSupportedModels((product as any)?.aiPromptPack?.supportedModels ?? []);
    setUseCases((product as any)?.aiPromptPack?.categories ?? []);
    setPrompts((product as any)?.aiPromptPack?.prompts ?? []);
    setTags((product as any)?.tags ?? []);
    setTemplateCompatibility((product as any)?.template?.compatibility ?? []);
    setTemplateFeatures((product as any)?.template?.features ?? []);
    setTemplateCustomization((product as any)?.template?.customizationLevel ?? "medium");
    setTemplateIncludesAssets(!!(product as any)?.template?.includesAssets);
    setTechStack((product as any)?.developerBoilerplate?.techStack ?? []);
    setArchitecture((product as any)?.developerBoilerplate?.architecture ?? "");
    setDevIncludesAuth(!!(product as any)?.developerBoilerplate?.includesAuth);
    setDevIncludesDatabase(!!(product as any)?.developerBoilerplate?.includesDatabase);
    setDevIncludesTesting(!!(product as any)?.developerBoilerplate?.includesTesting);
    setDevDeploymentReady(!!(product as any)?.developerBoilerplate?.deploymentReady);
    setDevDocumentation(!!(product as any)?.developerBoilerplate?.documentation);
    setWorkflowType((product as any)?.workflowSystem?.workflowType ?? "");
    setWorkflowSteps((product as any)?.workflowSystem?.stepsCount ?? 0);
    setWorkflowTools((product as any)?.workflowSystem?.tools ?? []);
    setIntegrationLevel((product as any)?.workflowSystem?.integrationLevel ?? "basic");
    setTimeToImplement((product as any)?.workflowSystem?.timeToImplement ?? "");
    setWorkflowPlatforms((product as any)?.workflowSystem?.platforms ?? []);
    setGuideComplexity((product as any)?.automationGuide?.complexity ?? "beginner");
    setGuidePrerequisites((product as any)?.automationGuide?.prerequisites ?? []);
    setGuideTools((product as any)?.automationGuide?.toolsRequired ?? []);
    setGuideTime((product as any)?.automationGuide?.estimatedTime ?? "");
    setGuideOutcomes((product as any)?.automationGuide?.outcomes ?? []);
    setGuideIncludesTemplates(!!(product as any)?.automationGuide?.includesTemplates);
    setFrameworkMethodology((product as any)?.productivityFramework?.methodology ?? "");
    setFrameworkComponents((product as any)?.productivityFramework?.components ?? []);
    setFrameworkIntegrations((product as any)?.productivityFramework?.integrations ?? []);
    setFrameworkScalability((product as any)?.productivityFramework?.scalability ?? "personal");
    setFrameworkIncludesTemplates(!!(product as any)?.productivityFramework?.includesTemplates);
    setFrameworkIncludesWorkflows(!!(product as any)?.productivityFramework?.includesWorkflows);
  }, [product]);

  // Initialize from product data
  useEffect(() => {
    if ((product as any)?.codeTemplate?.codeFiles) {
      setCodeFiles((product as any).codeTemplate.codeFiles);
    }
    if ((product as any)?.codeTemplate?.framework) {
      setFramework((product as any).codeTemplate.framework);
    }
    if ((product as any)?.codeTemplate?.language) {
      setLanguage((product as any).codeTemplate.language);
    }
    if ((product as any)?.codeTemplate?.componentType) {
      setComponentType((product as any).codeTemplate.componentType);
    }
    if ((product as any)?.codeTemplate?.dependencies) {
      setDependencies((product as any).codeTemplate.dependencies);
    }
    if ((product as any)?.template?.componentDeliverables) {
      setComponentDeliverables((product as any).template.componentDeliverables);
    }
    if ((product as any)?.deliverables?.length > 0) {
      setDeliverables((product as any).deliverables);
    } else if ((product as any)?.template?.deliverables?.length > 0) {
      setDeliverables((product as any).template.deliverables);
    }
  }, [product]);

  // Code file management
  const addCodeFile = () => {
    const newFile: CodeFile = {
      filename: `component.${language === 'typescript' ? 'tsx' : language === 'javascript' ? 'js' : 'jsx'}`,
      content: "",
      language: language
    };
    setCodeFiles([...codeFiles, newFile]);
    setActiveCodeFile(codeFiles.length);
  };

  const removeCodeFile = (index: number) => {
    const updated = codeFiles.filter((_, i) => i !== index);
    setCodeFiles(updated);
    if (activeCodeFile >= updated.length) {
      setActiveCodeFile(Math.max(0, updated.length - 1));
    }
  };

  const updateCodeFile = (index: number, field: keyof CodeFile, value: string) => {
    const updated = [...codeFiles];
    updated[index] = { ...updated[index], [field]: value };
    setCodeFiles(updated);
  };

  // Dependencies
  const addDependency = () => {
    if (dependencyInput.trim() && !dependencies.includes(dependencyInput.trim())) {
      setDependencies([...dependencies, dependencyInput.trim()]);
      setDependencyInput("");
    }
  };

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  // Deliverables handlers
  const handleAddToDeliverables = (component: ComponentDeliverable) => {
    setComponentDeliverables(prev => [...prev, component]);
  };

  const handleAddSingleDeliverable = (file: CodeFile, index: number) => {
    const deliverableName = file.filename;
    
    // Check if component with same name already exists
    const isDuplicate = componentDeliverables.some(d => 
      d.name === deliverableName || 
      d.codeFiles.some(cf => cf.filename === file.filename)
    );
    
    if (isDuplicate) {
      toast.error(`${deliverableName} is already in deliverables. Each component can only be added once.`);
      return;
    }
    
    const deliverable: ComponentDeliverable = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: deliverableName,
      description: `${componentType} component built with ${framework}`,
      componentType: componentType,
      framework: framework,
      language: language,
      codeFiles: [file],
      dependencies: dependencies,
      createdAt: new Date()
    };

    setComponentDeliverables(prev => [...prev, deliverable]);
    toast.success(`${deliverable.name} added to deliverables`);
  };

  const handleDeliverablesChange = (updatedDeliverables: ComponentDeliverable[]) => {
    setComponentDeliverables(updatedDeliverables);
    // Sync with main deliverables - convert ComponentDeliverable to Deliverable format
    const codeDeliverables = updatedDeliverables.map(cd => ({
      label: cd.name || "Code File",
      url: cd.previewUrl || "",
      kind: "code" as const
    }));
    
    // Filter out existing code deliverables and add new ones
    setDeliverables(prev => {
      const nonCodeDeliverables = prev.filter(d => d.kind !== "code");
      return [...nonCodeDeliverables, ...codeDeliverables];
    });
  };

  const handleFileUpload = async (idx: number, file: File) => {
    if (!file) return;
    
    setUploadingFile(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', file.name);
      
      const response = await apiClient.post(`/api/creator/products/${productId}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.ok) {
        setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, url: response.data.fileUrl, label: file.name } : x));
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(null);
    }
  };
  const selectedCategory = categories.find(cat => cat.value === templateKind);

  async function saveBasics() {
    // Validation: Check for required deliverables
    const hasImage = assets.length > 0;

    if (isAIPromptPack || isTemplate || isWorkflow || isGuide || isFramework) {
      if (!hasImage) {
        toast.error("Please add at least 1 preview image (use Preview Images section)");
        return;
      }
    } else {
      const hasComponent = codeFiles.length > 0;
      if (!hasComponent || !hasImage) {
        const missing = [];
        if (!hasComponent) missing.push('at least 1 code component/file');
        if (!hasImage) missing.push('at least 1 preview image (use Preview Images section)');
        toast.error(`Please add the following required deliverables:\n- ${missing.join('\n- ')}`);
        return;
      }
    }

    setLoading(true);
    try {
      const body: PatchProductBody = {
        title,
        price,
        category: templateKind,
        installInstructions,
        deliverables, // Add deliverables at top level
        tags,
        ...(isAIPromptPack && {
          aiPromptPack: { supportedModels, categories: useCases, prompts },
        } as any),
        template: {
          kind: templateKind,
          ...(templateTool && { tool: templateTool }),
          deliverables,
          ...(isCodeTemplate && {
            componentDeliverables: componentDeliverables.length > 0 ? componentDeliverables : undefined
          }),
          ...(isTemplate && {
            compatibility: templateCompatibility,
            features: templateFeatures,
            customizationLevel: templateCustomization,
            includesAssets: templateIncludesAssets,
          }),
        },
        ...(isDevBoilerplate && {
          developerBoilerplate: {
            techStack,
            architecture,
            includesAuth: devIncludesAuth,
            includesDatabase: devIncludesDatabase,
            includesTesting: devIncludesTesting,
            deploymentReady: devDeploymentReady,
            documentation: devDocumentation,
          },
        } as any),
        ...(isWorkflow && {
          workflowSystem: {
            workflowType,
            stepsCount: workflowSteps,
            tools: workflowTools,
            integrationLevel,
            timeToImplement,
            platforms: workflowPlatforms,
          },
        } as any),
        ...(isGuide && {
          automationGuide: {
            complexity: guideComplexity,
            prerequisites: guidePrerequisites,
            toolsRequired: guideTools,
            estimatedTime: guideTime,
            outcomes: guideOutcomes,
            includesTemplates: guideIncludesTemplates,
          },
        } as any),
        ...(isFramework && {
          productivityFramework: {
            methodology: frameworkMethodology,
            components: frameworkComponents,
            integrations: frameworkIntegrations,
            scalability: frameworkScalability,
            includesTemplates: frameworkIncludesTemplates,
            includesWorkflows: frameworkIncludesWorkflows,
          },
        } as any),
        description,
        ...(isCodeTemplate && {
          codeFiles: codeFiles.length > 0 ? codeFiles : undefined,
          framework: codeFiles.length > 0 ? framework : undefined,
          language: codeFiles.length > 0 ? language : undefined,
          componentType: codeFiles.length > 0 ? componentType : undefined,
          dependencies: codeFiles.length > 0 ? dependencies : undefined,
          hasLivePreview: codeFiles.length > 0 ? hasLivePreview : undefined,
          sandboxEnabled: codeFiles.length > 0 ? sandboxEnabled : undefined,
          componentDeliverables: componentDeliverables.length > 0 ? componentDeliverables : undefined
        })
      };

      if (typeof description === "string" && description.trim()) {
        body.description = description.trim();
      }

      const res = await apiClient.patch<ProductRes>(
        `/api/creator/products/${productId}`,
        body
      );

      if (!res.data.ok) throw new Error("Failed to update basic details");
      onProductChange(res.data.product);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function setCover(imageAssetId: string) {
    setLoading(true);
    try {
      const res = await apiClient.patch<ProductRes>(
        `/api/creator/products/${productId}/cover`,
        { imageAssetId }
      );
      if (!res.data.ok) throw new Error("Failed to save cover image");
      onProductChange(res.data.product);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function removeAsset(asset: ImageAsset) {
    setLoading(true);
    try {
      const res = await apiClient.delete(
        `/api/creator/products/${productId}/assets/${asset._id}`
      );
      if (!res.data.ok) throw new Error("Failed to remove asset");
      onRefresh();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setLoading(true);
    try {
      const res = await apiClient.patch<ProductRes>(
        `/api/creator/products/${productId}/publish`
      );
      if (!res.data.ok) throw new Error("Failed to publish");
      onProductChange(res.data.product);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct() {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.delete(`/api/creator/products/${productId}`);
      if (!res.data.ok) {
        toast.error(res.data.error || "Failed to delete template");
        return;
      }
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAssetsOnly() {
    setLoading(true);
    try {
      const res = await apiClient.get<AssetsRes>(
        `/api/creator/products/${productId}/assets`
      );
      if (!res.data.ok) throw new Error("Failed to fetch assets");
      onAssetsChange(res.data.assets ?? []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full pb-32">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Template</h2>
                  <p className="text-sm text-neutral-400">Slug: {product?.slug}</p>
                </div>
                <Badge 
                  variant={product?.visibility === "draft" ? "secondary" : "default"}
                  className={`ml-2 ${
                    product?.visibility === "draft" 
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  }`}
                >
                  {product?.visibility === "draft" ? "Draft" : "Published"}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={saveBasics}
                  disabled={loading}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                
                {product.visibility === "draft" ? (
                  <Button
                    onClick={publish}
                    disabled={loading}
                    className="bg-neutral-800/50 backdrop-blur-sm border border-green-500/30 hover:bg-green-500/10 text-green-400 transition-all"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                ) : (
                  <Button disabled className="bg-neutral-800/30 backdrop-blur-sm border border-green-500/20 text-green-400/50">
                    Published
                  </Button>
                )}
                
                <Button
                  onClick={refreshAssetsOnly}
                  className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 text-neutral-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={deleteProduct}
                  disabled={loading}
                  className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column - Editor */}
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "details", label: "Details", icon: Package },
              { id: "code", label: "Code", icon: Code2, show: isCodeTemplate },
              { id: "deliverables", label: "Deliverables", icon: Box, show: isCodeTemplate },
            ].filter(step => step.show !== false).map((step, index) => {
              const Icon = step.icon;
              const isActive = currentTab === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentTab(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-neutral-800/50 backdrop-blur-sm border border-violet-500/50 text-white"
                      : "bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isActive ? "bg-violet-500/20 text-violet-400" : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {index + 1}
                  </div>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* Details Tab */}
            {currentTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Basic Info Card */}
                  <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Package className="w-5 h-5 text-violet-400" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Title *</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Premium React Dashboard"
                          className="h-12 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                        />
                      </div>

                      {/* Category Dropdown */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Category *</label>
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-white hover:border-neutral-700 transition-colors"
                        >
                          <span className={selectedCategory ? "text-white" : "text-neutral-500"}>
                            {selectedCategory ? (
                              <>
                                {(() => {
                                  const Icon = getCategoryIcon(selectedCategory.iconName);
                                  return <Icon className="w-5 h-5 inline mr-2 text-white" />;
                                })()}
                                {selectedCategory.label}
                              </>
                            ) : "Select a category"}
                          </span>
                          <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
                        </button>
                        
                        {showCategoryDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {categories.map((cat) => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  setTemplateKind(cat.value);
                                  setShowCategoryDropdown(false);
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-neutral-800 transition-colors"
                              >
                                {(() => {
                                  const Icon = getCategoryIcon(cat.iconName);
                                  return <Icon className="w-5 h-5 text-white" />;
                                })()}
                                <span className="text-white">{cat.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Price (₹) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                          <Input
                            type="number"
                            min={1}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="199"
                            className="h-12 pl-8 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Tags</label>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addTag(tagInput);
                              }
                            }}
                            placeholder="Add a tag and press Enter"
                            className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                          />
                          <Button type="button" onClick={() => addTag(tagInput)} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300">
                                {tag}
                                <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-white">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tool/Framework */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Primary Tool/Framework</label>
                        <select
                          value={templateTool}
                          onChange={(e) => setTemplateTool(e.target.value)}
                          className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-violet-500/50"
                        >
                          <option value="">Select primary tool</option>
                          <option value="notion">Notion</option>
                          <option value="figma">Figma</option>
                          <option value="react">React</option>
                          <option value="nextjs">Next.js</option>
                          <option value="vue">Vue.js</option>
                          <option value="angular">Angular</option>
                          <option value="typescript">TypeScript</option>
                          <option value="javascript">JavaScript</option>
                          <option value="css">CSS</option>
                          <option value="html">HTML</option>
                          <option value="chatgpt">ChatGPT</option>
                          <option value="claude">Claude</option>
                          <option value="midjourney">Midjourney</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <FileCode className="w-5 h-5 text-pink-400" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Tell buyers about your template</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe what your template does, its features, and why people should buy it..."
                          className="min-h-[200px] bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50 resize-none"
                        />
                        <div className="text-xs text-neutral-500 text-right">
                          {description.length}/500 characters
                        </div>
                      </div>

                      {/* Install Instructions */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Install / Usage Instructions</label>
                        <Textarea
                          value={installInstructions}
                          onChange={(e) => setInstallInstructions(e.target.value)}
                          placeholder="How to use this template (steps, requirements, etc.)"
                          className="min-h-[120px] bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50 resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Prompt Pack specific fields */}
                {isAIPromptPack && (
                  <div className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* Compatible Platforms */}
                      <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2 text-white">
                            <Bot className="w-4 h-4 text-violet-400" />
                            Compatible Platforms
                          </CardTitle>
                          <p className="text-xs text-neutral-500">Select all AI tools these prompts work with</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {AI_PLATFORMS.map((p) => {
                              const selected = supportedModels.includes(p.value);
                              return (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => toggleModel(p.value)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    selected
                                      ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                                      : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                                  }`}
                                >
                                  <span>{p.icon}</span>
                                  {p.label}
                                  {selected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                          {supportedModels.length > 0 && (
                            <p className="text-xs text-violet-400 mt-3">{supportedModels.length} platform{supportedModels.length !== 1 ? "s" : ""} selected</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Use Cases */}
                      <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2 text-white">
                            <Zap className="w-4 h-4 text-amber-400" />
                            Use Cases
                          </CardTitle>
                          <p className="text-xs text-neutral-500">What can buyers use these prompts for?</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {AI_USE_CASES.map((uc) => {
                              const selected = useCases.includes(uc.value);
                              return (
                                <button
                                  key={uc.value}
                                  type="button"
                                  onClick={() => toggleUseCase(uc.value)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    selected
                                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                      : "bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                                  }`}
                                >
                                  {uc.label}
                                  {selected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                          {useCases.length > 0 && (
                            <p className="text-xs text-amber-400 mt-3">{useCases.length} use case{useCases.length !== 1 ? "s" : ""} selected</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Prompts Management */}
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2 text-white">
                            <Bot className="w-4 h-4 text-violet-400" />
                            Prompts
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-violet-500/10 border border-violet-500/30 text-violet-400 font-normal">
                              {prompts.length} saved
                            </span>
                          </CardTitle>
                          <p className="text-xs text-neutral-500 mt-1">Add your prompts — they are saved as deliverables and buyers can run them via Gemini (without seeing the text)</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setPrompts(prev => [...prev, { label: "", content: "" }])}
                          className="shrink-0 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 text-violet-300 transition-all"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add Prompt
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {prompts.length === 0 ? (
                          <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No prompts yet.</p>
                            <p className="text-xs mt-1">Click "Add Prompt" to start building your pack.</p>
                          </div>
                        ) : (
                          prompts.map((p, idx) => (
                            <div key={idx} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-neutral-500 font-mono w-6 shrink-0">#{idx + 1}</span>
                                <input
                                  type="text"
                                  value={p.label}
                                  onChange={(e) => setPrompts(prev => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                                  placeholder="Prompt label (e.g., Blog Post Writer)"
                                  className="flex-1 h-9 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPromptRunnerText(p.content);
                                    setPromptContext("");
                                  }}
                                  title="Load into test runner"
                                  className="h-9 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrompts(prev => prev.filter((_, i) => i !== idx))}
                                  className="h-9 px-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                value={p.content}
                                onChange={(e) => setPrompts(prev => prev.map((x, i) => i === idx ? { ...x, content: e.target.value } : x))}
                                placeholder="Paste your full prompt here..."
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50 focus:outline-none resize-none"
                              />
                              <p className="text-xs text-neutral-600 text-right">{p.content.length} chars</p>
                            </div>
                          ))
                        )}

                        {/* Test Runner */}
                        <div className="pt-2 border-t border-neutral-800 space-y-3">
                          <p className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-emerald-400" />
                            Test Runner
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Powered by Gemini</span>
                          </p>
                          <input
                            type="text"
                            placeholder="Context / Role (optional)"
                            value={promptContext}
                            onChange={(e) => setPromptContext(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50 focus:outline-none"
                          />
                          <textarea
                            placeholder="Paste or load a prompt to test it..."
                            value={promptRunnerText}
                            onChange={(e) => setPromptRunnerText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50 focus:outline-none resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-600">{promptRunnerText.length}/4000</p>
                            <button
                              type="button"
                              onClick={runPrompt}
                              disabled={runningPrompt || !promptRunnerText.trim()}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {runningPrompt ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Run</>}
                            </button>
                          </div>
                          {promptError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                              <X className="w-4 h-4 shrink-0" />{promptError}
                            </div>
                          )}
                          {promptRunnerOutput && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Gemini Output
                                </span>
                                <button type="button" onClick={() => setPromptRunnerOutput("")} className="text-neutral-600 hover:text-neutral-400">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/20 text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                                {promptRunnerOutput}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Template Metadata Section ── */}
                {isTemplate && (
                  <div className="space-y-4">
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-white">
                          <Palette className="w-4 h-4 text-pink-400" />
                          Template Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {/* Compatible Apps */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Compatible Apps / Tools</label>
                          <div className="flex gap-2">
                            <Input
                              value={compatibilityInput}
                              onChange={(e) => setCompatibilityInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const v = compatibilityInput.trim();
                                  if (v && !templateCompatibility.includes(v)) setTemplateCompatibility(prev => [...prev, v]);
                                  setCompatibilityInput("");
                                }
                              }}
                              placeholder="e.g. Notion 2.0, Figma…"
                              className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                            />
                            <Button type="button" onClick={() => {
                              const v = compatibilityInput.trim();
                              if (v && !templateCompatibility.includes(v)) setTemplateCompatibility(prev => [...prev, v]);
                              setCompatibilityInput("");
                            }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {templateCompatibility.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300">
                                {t}<button type="button" onClick={() => setTemplateCompatibility(prev => prev.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Included Features</label>
                          <div className="flex gap-2">
                            <Input
                              value={featureInput}
                              onChange={(e) => setFeatureInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const v = featureInput.trim();
                                  if (v && !templateFeatures.includes(v)) setTemplateFeatures(prev => [...prev, v]);
                                  setFeatureInput("");
                                }
                              }}
                              placeholder="e.g. Dark mode, Kanban board…"
                              className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                            />
                            <Button type="button" onClick={() => {
                              const v = featureInput.trim();
                              if (v && !templateFeatures.includes(v)) setTemplateFeatures(prev => [...prev, v]);
                              setFeatureInput("");
                            }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {templateFeatures.map(f => (
                              <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                {f}<button type="button" onClick={() => setTemplateFeatures(prev => prev.filter(x => x !== f))}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Customization Level */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Customization Level</label>
                          <div className="flex gap-2">
                            {(["low", "medium", "high"] as const).map(lvl => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setTemplateCustomization(lvl)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${templateCustomization === lvl ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}
                              >
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Includes Assets */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={templateIncludesAssets} onChange={e => setTemplateIncludesAssets(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                          <span className="text-sm text-neutral-300">Includes design assets / source files</span>
                        </label>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Developer Boilerplate Section ── */}
                {isDevBoilerplate && (
                  <div className="space-y-4">
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-white">
                          <Code2 className="w-4 h-4 text-yellow-400" />
                          Developer Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {/* Tech Stack */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Tech Stack</label>
                          <div className="flex gap-2">
                            <Input
                              value={techStackInput}
                              onChange={(e) => setTechStackInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const v = techStackInput.trim();
                                  if (v && !techStack.includes(v)) setTechStack(prev => [...prev, v]);
                                  setTechStackInput("");
                                }
                              }}
                              placeholder="e.g. React, Node.js, MongoDB…"
                              className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                            />
                            <Button type="button" onClick={() => {
                              const v = techStackInput.trim();
                              if (v && !techStack.includes(v)) setTechStack(prev => [...prev, v]);
                              setTechStackInput("");
                            }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {techStack.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
                                {t}<button type="button" onClick={() => setTechStack(prev => prev.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Architecture */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Architecture</label>
                          <div className="flex flex-wrap gap-2">
                            {(["mvc", "spa", "fullstack", "microservices", "serverless"] as const).map(arch => (
                              <button
                                key={arch}
                                type="button"
                                onClick={() => setArchitecture(arch)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${architecture === arch ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}
                              >
                                {arch.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Feature toggles */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Includes</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { state: devIncludesAuth, setter: setDevIncludesAuth, icon: <Lock className="w-3.5 h-3.5" />, label: "Authentication" },
                              { state: devIncludesDatabase, setter: setDevIncludesDatabase, icon: <Database className="w-3.5 h-3.5" />, label: "Database Setup" },
                              { state: devIncludesTesting, setter: setDevIncludesTesting, icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Tests / Test Suite" },
                              { state: devDeploymentReady, setter: setDevDeploymentReady, icon: <Rocket className="w-3.5 h-3.5" />, label: "Deployment Ready" },
                              { state: devDocumentation, setter: setDevDocumentation, icon: <BookOpen className="w-3.5 h-3.5" />, label: "Documentation" },
                            ].map(({ state, setter, icon, label }) => (
                              <label key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${state ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-neutral-900 border-neutral-700 text-neutral-400"}`}>
                                <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500 shrink-0" />
                                <span className="flex items-center gap-1.5 text-xs font-medium">{icon}{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Workflow / Automation Section ── */}
                {isWorkflow && (
                  <div className="space-y-4">
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-white">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Workflow Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {/* Workflow Type */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Workflow Type</label>
                          <select
                            value={workflowType}
                            onChange={e => setWorkflowType(e.target.value)}
                            className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-violet-500/50"
                          >
                            <option value="">Select type</option>
                            {["automation", "productivity", "business", "ai", "integration"].map(t => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Steps + Time grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1"><GitBranch className="w-3 h-3" /> Steps Count</label>
                            <Input type="number" min={0} value={workflowSteps || ""} onChange={e => setWorkflowSteps(Number(e.target.value))} placeholder="0" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Setup Time</label>
                            <Input value={timeToImplement} onChange={e => setTimeToImplement(e.target.value)} placeholder="e.g. 30min, 2 hours" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                          </div>
                        </div>

                        {/* Tools */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Tools & Integrations</label>
                          <div className="flex gap-2">
                            <Input value={workflowToolInput} onChange={e => setWorkflowToolInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = workflowToolInput.trim(); if (v && !workflowTools.includes(v)) setWorkflowTools(prev => [...prev, v]); setWorkflowToolInput(""); }}} placeholder="e.g. Zapier, n8n, Make…" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                            <Button type="button" onClick={() => { const v = workflowToolInput.trim(); if (v && !workflowTools.includes(v)) setWorkflowTools(prev => [...prev, v]); setWorkflowToolInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {workflowTools.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                                {t}<button type="button" onClick={() => setWorkflowTools(prev => prev.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Platforms */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Platforms</label>
                          <div className="flex gap-2">
                            <Input value={platformInput} onChange={e => setPlatformInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = platformInput.trim(); if (v && !workflowPlatforms.includes(v)) setWorkflowPlatforms(prev => [...prev, v]); setPlatformInput(""); }}} placeholder="e.g. Web, Mobile, Desktop" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                            <Button type="button" onClick={() => { const v = platformInput.trim(); if (v && !workflowPlatforms.includes(v)) setWorkflowPlatforms(prev => [...prev, v]); setPlatformInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {workflowPlatforms.map(p => (
                              <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                                {p}<button type="button" onClick={() => setWorkflowPlatforms(prev => prev.filter(x => x !== p))}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Integration Level */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300">Integration Complexity</label>
                          <div className="flex gap-2">
                            {["basic", "intermediate", "advanced"].map(lvl => (
                              <button key={lvl} type="button" onClick={() => setIntegrationLevel(lvl)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${integrationLevel === lvl ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}>
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Guide / Framework Section ── */}
                {(isGuide || isFramework) && (
                  <div className="space-y-4">
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-white">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          {isFramework ? "Framework Details" : "Guide Details"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {isGuide && (
                          <>
                            {/* Complexity */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">Difficulty Level</label>
                              <div className="flex gap-2">
                                {(["beginner", "intermediate", "advanced"] as const).map(lvl => (
                                  <button key={lvl} type="button" onClick={() => setGuideComplexity(lvl)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${guideComplexity === lvl ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}>
                                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Estimated Time */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Estimated Completion Time</label>
                              <Input value={guideTime} onChange={e => setGuideTime(e.target.value)} placeholder="e.g. 2 hours, 1 week" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                            </div>

                            {/* Prerequisites */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">Prerequisites</label>
                              <div className="flex gap-2">
                                <Input value={prereqInput} onChange={e => setPrereqInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = prereqInput.trim(); if (v && !guidePrerequisites.includes(v)) setGuidePrerequisites(prev => [...prev, v]); setPrereqInput(""); }}} placeholder="e.g. Basic JavaScript knowledge" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                                <Button type="button" onClick={() => { const v = prereqInput.trim(); if (v && !guidePrerequisites.includes(v)) setGuidePrerequisites(prev => [...prev, v]); setPrereqInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {guidePrerequisites.map(p => (
                                  <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-800 border border-neutral-700 text-neutral-300">
                                    {p}<button type="button" onClick={() => setGuidePrerequisites(prev => prev.filter(x => x !== p))}><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Tools Required */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Tools Required</label>
                              <div className="flex gap-2">
                                <Input value={guideToolInput} onChange={e => setGuideToolInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = guideToolInput.trim(); if (v && !guideTools.includes(v)) setGuideTools(prev => [...prev, v]); setGuideToolInput(""); }}} placeholder="e.g. VS Code, Docker" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                                <Button type="button" onClick={() => { const v = guideToolInput.trim(); if (v && !guideTools.includes(v)) setGuideTools(prev => [...prev, v]); setGuideToolInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {guideTools.map(t => (
                                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300">
                                    {t}<button type="button" onClick={() => setGuideTools(prev => prev.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Outcomes */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">What Buyers Will Achieve</label>
                              <div className="flex gap-2">
                                <Input value={outcomeInput} onChange={e => setOutcomeInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = outcomeInput.trim(); if (v && !guideOutcomes.includes(v)) setGuideOutcomes(prev => [...prev, v]); setOutcomeInput(""); }}} placeholder="e.g. Build a full-stack app" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                                <Button type="button" onClick={() => { const v = outcomeInput.trim(); if (v && !guideOutcomes.includes(v)) setGuideOutcomes(prev => [...prev, v]); setOutcomeInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {guideOutcomes.map(o => (
                                  <span key={o} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                    {o}<button type="button" onClick={() => setGuideOutcomes(prev => prev.filter(x => x !== o))}><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={guideIncludesTemplates} onChange={e => setGuideIncludesTemplates(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                              <span className="text-sm text-neutral-300">Includes ready-to-use templates</span>
                            </label>
                          </>
                        )}

                        {isFramework && (
                          <>
                            {/* Methodology */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">Methodology</label>
                              <Input value={frameworkMethodology} onChange={e => setFrameworkMethodology(e.target.value)} placeholder="e.g. GTD, PARA, OKR, Agile" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                            </div>

                            {/* Scalability */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Designed For</label>
                              <div className="flex gap-2">
                                {["personal", "team", "enterprise"].map(s => (
                                  <button key={s} type="button" onClick={() => setFrameworkScalability(s)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${frameworkScalability === s ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"}`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Components */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">Framework Components</label>
                              <div className="flex gap-2">
                                <Input value={frameworkComponentInput} onChange={e => setFrameworkComponentInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = frameworkComponentInput.trim(); if (v && !frameworkComponents.includes(v)) setFrameworkComponents(prev => [...prev, v]); setFrameworkComponentInput(""); }}} placeholder="e.g. Weekly Review, Goal Tracker" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                                <Button type="button" onClick={() => { const v = frameworkComponentInput.trim(); if (v && !frameworkComponents.includes(v)) setFrameworkComponents(prev => [...prev, v]); setFrameworkComponentInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {frameworkComponents.map(c => (
                                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                    {c}<button type="button" onClick={() => setFrameworkComponents(prev => prev.filter(x => x !== c))}><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Integrations */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-300">Tool Integrations</label>
                              <div className="flex gap-2">
                                <Input value={frameworkIntegrationInput} onChange={e => setFrameworkIntegrationInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = frameworkIntegrationInput.trim(); if (v && !frameworkIntegrations.includes(v)) setFrameworkIntegrations(prev => [...prev, v]); setFrameworkIntegrationInput(""); }}} placeholder="e.g. Notion, Todoist, Google Cal" className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50" />
                                <Button type="button" onClick={() => { const v = frameworkIntegrationInput.trim(); if (v && !frameworkIntegrations.includes(v)) setFrameworkIntegrations(prev => [...prev, v]); setFrameworkIntegrationInput(""); }} className="h-10 bg-neutral-800/50 border border-neutral-700 text-white"><Plus className="w-4 h-4" /></Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {frameworkIntegrations.map(i => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300">
                                    {i}<button type="button" onClick={() => setFrameworkIntegrations(prev => prev.filter(x => x !== i))}><X className="w-3 h-3" /></button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={frameworkIncludesTemplates} onChange={e => setFrameworkIncludesTemplates(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                                <span className="text-sm text-neutral-300">Includes ready-to-use templates</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={frameworkIncludesWorkflows} onChange={e => setFrameworkIncludesWorkflows(e.target.checked)} className="w-4 h-4 accent-violet-500" />
                                <span className="text-sm text-neutral-300">Includes pre-built workflows</span>
                              </label>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* AI Insights - Above Deliverables */}
                <AIDashboard
                  productId={productId}
                  productTitle={product.title}
                  productCategory={product.category}
                  productFeatures={product.template?.features || product.aiPromptPack?.categories || []}
                  productPrice={product.price}
                  productDescription={product.description || ""}
                  deliverables={product.deliverables || []}
                />

              </motion.div>
            )}

            {/* Code Editor Tab */}
            {currentTab === "code" && isCodeTemplate && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Code Settings */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Settings className="w-5 h-5 text-violet-400" />
                      Code Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Framework</label>
                        <select
                          value={framework}
                          onChange={(e) => setFramework(e.target.value)}
                          className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                        >
                          <option value="react">React</option>
                          <option value="vue">Vue</option>
                          <option value="angular">Angular</option>
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="css">CSS</option>
                          <option value="html">HTML</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="jsx">JSX</option>
                          <option value="tsx">TSX</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Component Type</label>
                        <select
                          value={componentType}
                          onChange={(e) => setComponentType(e.target.value)}
                          className="w-full h-12 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                        >
                          <option value="component">Component</option>
                          <option value="page">Page</option>
                          <option value="hook">Hook</option>
                          <option value="utility">Utility</option>
                          <option value="template">Template</option>
                          <option value="layout">Layout</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-neutral-300">
                        <input
                          type="checkbox"
                          checked={hasLivePreview}
                          onChange={(e) => setHasLivePreview(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-violet-500"
                        />
                        <Eye className="w-4 h-4" />
                        Enable Live Preview
                      </label>
                      <label className="flex items-center gap-2 text-neutral-300">
                        <input
                          type="checkbox"
                          checked={sandboxEnabled}
                          onChange={(e) => setSandboxEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-violet-500"
                        />
                        <Box className="w-4 h-4" />
                        Enable Sandbox
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Dependencies */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add dependency (e.g., react, lodash)"
                        value={dependencyInput}
                        onChange={(e) => setDependencyInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addDependency();
                          }
                        }}
                        className="flex-1 h-12 bg-neutral-950 border-neutral-800 text-white"
                      />
                      <Button
                        type="button"
                        onClick={addDependency}
                        disabled={!dependencyInput.trim()}
                        className="h-12 px-6 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {dependencies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {dependencies.map((dep, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                            onClick={() => removeDependency(index)}
                          >
                            {dep}
                            <X className="w-3 h-3 ml-2" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Code Files */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-white">Code Files</CardTitle>
                    <Button
                      type="button"
                      onClick={addCodeFile}
                      className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add File
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {codeFiles.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                          <FileCode className="w-8 h-8 text-neutral-500" />
                        </div>
                        <p className="text-neutral-400 mb-4">No code files yet</p>
                        <Button
                          type="button"
                          onClick={addCodeFile}
                          className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first file
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* File Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {codeFiles.map((file, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setActiveCodeFile(index)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                activeCodeFile === index
                                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/50"
                                  : "bg-neutral-800 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {file.filename}
                            </button>
                          ))}
                        </div>

                        {/* Active File Editor */}
                        {codeFiles.map((file, index) => (
                          <div key={index} className={activeCodeFile === index ? 'block' : 'hidden'}>
                            <div className="flex items-center gap-2 mb-3">
                              <Input
                                value={file.filename}
                                onChange={(e) => updateCodeFile(index, 'filename', e.target.value)}
                                placeholder="Filename"
                                className="flex-1 h-12 bg-neutral-950 border-neutral-800 text-white"
                              />
                              <Button
                                type="button"
                                onClick={() => handleAddSingleDeliverable(file, index)}
                                size="sm"
                                className="h-12 bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 hover:bg-violet-500/20 text-violet-400 transition-all"
                                title="Add to deliverables"
                              ><Package className="w-4 h-4" />Add to Deliverables
                                
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeCodeFile(index)}
                                size="sm"
                                className="h-12 bg-red-500/10 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={file.content}
                              onChange={(e) => updateCodeFile(index, 'content', e.target.value)}
                              placeholder={`Write your ${language} code here...`}
                              className="min-h-[300px] bg-neutral-950 border-neutral-800 text-white font-mono text-sm resize-none"
                            />
                          </div>
                        ))}

                        {/* Code Preview */}
                        {codeFiles.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-violet-400" />
                              Live Preview
                            </h4>
                            <div className="border border-neutral-800 rounded-xl overflow-hidden">
                              <CodeEditor
                                template={{
                                  framework,
                                  language,
                                  componentType,
                                  dependencies,
                                  hasLivePreview,
                                  sandboxEnabled,
                                  codeFiles
                                }}
                                deliverables={componentDeliverables}
                                onAddToDeliverables={handleAddToDeliverables}
                                showAddToDeliverables={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Deliverables Tab */}
            {currentTab === "deliverables" && isCodeTemplate && (
              <motion.div
                key="deliverables"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Box className="w-5 h-5 text-violet-400" />
                      Component Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeliverablesManager
                      deliverables={componentDeliverables}
                      onDeliverablesChange={handleDeliverablesChange}
                      readOnly={false}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg text-white">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              {coverUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-neutral-800 rounded-lg flex items-center justify-center">
                  <p className="text-neutral-500">No cover set</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Image Search */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-violet-400" />
                Google Image Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleImageSearch
                productId={productId}
                onImagesSelected={async () => onRefresh()}
              />
            </CardContent>
          </Card>

          {/* Preview Images */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">Preview Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload 
                productId={productId}
                onImagesUploaded={onRefresh}
              />
              <AssetsGrid
                assets={assets}
                title=""
                emptyText="No preview images yet"
                actionLabel={(asset) =>
                  String(asset._id) === String(product.coverImageAssetId) ? "Cover" : "Set as cover"
                }
                isActionActive={(asset) =>
                  String(asset._id) === String(product.coverImageAssetId)
                }
                onAction={(asset) => setCover(asset._id)}
                onRemove={(asset) => removeAsset(asset)}
              />
            </CardContent>
          </Card>

          {/* Document Deliverables */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Layers className="w-5 h-5 text-violet-400" />
                Document Deliverables
              </CardTitle>
              <Button
                type="button"
                onClick={() => setDeliverables(d => [...d, { label: "", url: "", kind: isTemplate || isWorkflow || isGuide || isFramework ? "link" : "code" }])}
                className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No deliverables yet.</p>
                  <p className="text-sm">{isTemplate || isWorkflow || isGuide || isFramework ? "Add links, PDFs or files." : "Add code or PDF resources."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliverables
                    .map((d, idx) => (
                    <div key={`del-${idx}`} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input
                          value={d.label}
                          onChange={(e) => setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                          placeholder="Label (e.g., Notion link)"
                          className="bg-neutral-900 border-neutral-800 text-white"
                        />
                        {d.kind === "link" ? (
                          <Input
                            value={d.url}
                            onChange={(e) => setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, url: e.target.value } : x))}
                            placeholder="https://notion.so/your-template..."
                            className="md:col-span-2 bg-neutral-900 border-neutral-800 text-white"
                          />
                        ) : d.kind === "file" ? (
                          <div className="md:col-span-2 flex gap-2">
                            <Input
                              value={d.url}
                              readOnly
                              placeholder={uploadingFile === idx ? "Uploading..." : "No file uploaded"}
                              className="flex-1 bg-neutral-900 border-neutral-800 text-white"
                            />
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
                                      toast.error('Only PDF files are allowed');
                                      return;
                                    }
                                    handleFileUpload(idx, file);
                                  }
                                }}
                                disabled={uploadingFile === idx}
                              />
                              <Button
                                type="button"
                                disabled={uploadingFile === idx}
                                className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 text-white transition-all"
                                asChild
                              >
                                <span>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadingFile === idx ? "Uploading..." : "Upload PDF"}
                                </span>
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <Input
                            value={d.url}
                            onChange={(e) => setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, url: e.target.value } : x))}
                            placeholder="Code content or URL..."
                            className="md:col-span-2 bg-neutral-900 border-neutral-800 text-white"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <select
                          value={d.kind}
                          onChange={(e) => setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, kind: e.target.value as any } : x))}
                          className="h-10 px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                        >
                          <option value="link">Link (URL)</option>
                          <option value="code">Code</option>
                          <option value="file">PDF File</option>
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setDeliverables(prev => prev.filter((_, i) => i !== idx))}
                          className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EditPanelRedesigned;
