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
  Trash2
} from "lucide-react";

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
  const router = useRouter();

  // Check if this is a code template
  const isCodeTemplate = templateKind?.includes("-template") || templateKind?.includes("-component") || 
                        templateTool === "react" || templateTool === "nextjs" || templateTool === "vue" ||
                        templateKind === "react_component" || templateKind === "dev_boilerplate";

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
      label: cd.label || cd.fileName || "Code File",
      url: cd.downloadUrl || cd.sourceCode || "",
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
    const hasComponent = codeFiles.length > 0;
    const hasPdf = deliverables.some(d => d.kind === 'file' && (d.label.toLowerCase().endsWith('.pdf') || d.url.toLowerCase().includes('.pdf')));
    const hasImage = assets.length > 0; // Check assets for preview images
    
    if (!hasComponent || !hasPdf || !hasImage) {
      const missing = [];
      if (!hasComponent) missing.push('at least 1 code component/file');
      if (!hasPdf) missing.push('at least 1 PDF file');
      if (!hasImage) missing.push('at least 1 preview image (use Preview Images section)');
      toast.error(`Please add the following required deliverables:\n- ${missing.join('\n- ')}`);
      return;
    }

    setLoading(true);
    try {
      const body: PatchProductBody = {
        title,
        price,
        category: templateKind,
        installInstructions,
        deliverables, // Add deliverables at top level
        template: {
          kind: templateKind,
          ...(templateTool && { tool: templateTool }),
          deliverables,
          ...(isCodeTemplate && {
            componentDeliverables: componentDeliverables.length > 0 ? componentDeliverables : undefined
          })
        },
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

                {/* Deliverables Section - Only Code and PDF */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Layers className="w-5 h-5 text-violet-400" />
                      Document Deliverables
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={() => setDeliverables(d => [...d, { label: "", url: "", kind: "code" }])}
                      className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {deliverables.filter(d => d.kind === "code" || d.kind === "file").length === 0 ? (
                      <div className="text-center py-8 text-neutral-400">
                        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No deliverables yet.</p>
                        <p className="text-sm">Add code or PDF resources.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {deliverables
                          .filter(d => d.kind === "code" || d.kind === "file")
                          .map((d, idx) => (
                          <div key={`del-${idx}`} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                            <div className="grid gap-3 md:grid-cols-3">
                              <Input
                                value={d.label}
                                onChange={(e) => setDeliverables(prev => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                                placeholder="Label (e.g., Notion link)"
                                className="bg-neutral-900 border-neutral-800 text-white"
                              />
                              {d.kind === "file" ? (
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
                                  placeholder={d.kind === "code" ? "Code content or URL..." : "URL"}
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
        </div>
      </div>
    </div>
  );
}

export default EditPanelRedesigned;
