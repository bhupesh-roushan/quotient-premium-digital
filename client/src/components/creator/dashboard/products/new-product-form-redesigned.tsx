"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  FileCode,
  Check,
  Sparkles,
  ChevronDown,
  Loader2,
  Bot,
  Play,
  X,
  Zap,
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

const categories = [
  { value: "notion-template", label: "Notion Template", icon: "📄" },
  { value: "resume-template", label: "Resume Template", icon: "📋" },
  { value: "ui-kit", label: "UI Kit", icon: "🎨" },
  { value: "figma-assets", label: "Figma Assets", icon: "🎯" },
  { value: "productivity-dashboard", label: "Productivity Dashboard", icon: "📊" },
  { value: "ai-prompt-pack", label: "AI Prompt Pack", icon: "🤖" },
  { value: "dev-boilerplate", label: "Developer Boilerplate", icon: "⚡" },
  { value: "mern-starter", label: "MERN Starter", icon: "🚀" },
  { value: "auth-system", label: "Auth System", icon: "🔐" },
  { value: "saas-starter", label: "SaaS Starter", icon: "💼" },
  { value: "api-scaffold", label: "API Scaffold", icon: "🔌" },
  { value: "workflow-system", label: "Workflow System", icon: "⚙️" },
  { value: "automation-pipeline", label: "Automation Pipeline", icon: "🔄" },
  { value: "ai-productivity", label: "AI Productivity", icon: "🧠" },
  { value: "business-guide", label: "Business Guide", icon: "📖" },
  { value: "automation-guide", label: "Automation Guide", icon: "📚" },
  { value: "productivity-framework", label: "Productivity Framework", icon: "📈" },
  { value: "react-template", label: "React Template", icon: "⚛️" },
  { value: "vue-template", label: "Vue Template", icon: "🟢" },
  { value: "angular-template", label: "Angular Template", icon: "🔺" },
  { value: "javascript-component", label: "JavaScript Component", icon: "📜" },
  { value: "typescript-component", label: "TypeScript Component", icon: "📘" },
  { value: "css-template", label: "CSS Template", icon: "🎨" },
  { value: "html-template", label: "HTML Template", icon: "🏗️" },
];

export default function NewProductFormRedesigned({ formId }: { formId: string }) {
  const router = useRouter();
  
  // Basic product info
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(100);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // AI Prompt Pack specific
  const [supportedModels, setSupportedModels] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [promptRunnerText, setPromptRunnerText] = useState("");
  const [promptContext, setPromptContext] = useState("");
  const [promptRunnerOutput, setPromptRunnerOutput] = useState("");
  const [runningPrompt, setRunningPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");

  const isAIPromptPack = category === "ai-prompt-pack";
  const selectedCategory = categories.find(c => c.value === category);

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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const productData: any = {
        title,
        price,
        category,
        description: description || `A high-quality ${category?.replace('-', ' ')} for creators and professionals.`,
        ...(isAIPromptPack && {
          aiPromptPack: {
            supportedModels,
            categories: useCases,
          },
        }),
      };

      const res = await apiClient.post("/api/creator/products", productData);

      if (res?.data?.ok) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        alert(`Error: ${res?.data?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err?.response?.data?.error || err?.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <form
        id={formId}
        onSubmit={onSubmit}
        className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 pb-20"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                Create New Template
              </h1>
              <p className="text-sm text-neutral-400">Share your creativity with the world</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps - Only Details */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm text-violet-400 text-xs"
          >
            <Package className="w-3 h-3" />
            <span className="text-xs font-medium">Details</span>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Left Column - Basic Info */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="w-4 h-4 text-violet-400" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Template Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">Template Name *</label>
                      <Input
                        placeholder="e.g., Premium React Dashboard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                        className="h-10 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-violet-500 focus:ring-violet-500/20"
                        required
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-medium text-neutral-300">Category *</label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="w-full h-10 px-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-white hover:border-neutral-700 transition-colors"
                      >
                        <span className={selectedCategory ? "text-white" : "text-neutral-500"}>
                          {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : "Select a category"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-lg z-50">
                          {categories.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setCategory(cat.value);
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-neutral-900 transition-colors ${
                                category === cat.value ? "bg-violet-500/10 text-violet-400" : "text-neutral-300"
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span className="text-sm">{cat.label}</span>
                              {category === cat.value && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">Price (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                        <Input
                          type="number"
                          min={1}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          disabled={loading}
                          className="h-10 pl-8 bg-neutral-950 border-neutral-800 text-white focus:border-violet-500 focus:ring-violet-500/20"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Description */}
                <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-pink-400" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300">
                        Tell buyers about your template
                      </label>
                      <Textarea
                        placeholder="Describe what your template does, its features, and why people should buy it..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        className="min-h-32 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
                      />
                      <p className="text-xs text-neutral-500">
                        {description.length}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Prompt Pack specific sections */}
              {isAIPromptPack && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Platforms + Use Cases row */}
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Compatible Platforms */}
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
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
                    <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
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

                  {/* Prompt Runner */}
                  <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm text-white border-violet-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Play className="w-4 h-4 text-emerald-400" />
                        Prompt Runner
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-normal">
                          Powered by Gemini
                        </span>
                      </CardTitle>
                      <p className="text-xs text-neutral-500">Test how your prompts perform before publishing</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Optional context */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">Context / Role (optional)</label>
                        <Input
                          type="text"
                          placeholder="e.g., You are a senior software engineer..."
                          value={promptContext}
                          onChange={(e) => setPromptContext(e.target.value)}
                          className="h-9 bg-neutral-950 border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50"
                        />
                      </div>

                      {/* Prompt input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-400">Test Prompt *</label>
                        <Textarea
                          placeholder="Paste one of your prompts here to preview the output..."
                          value={promptRunnerText}
                          onChange={(e) => setPromptRunnerText(e.target.value)}
                          className="min-h-24 bg-neutral-950 border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-violet-500/50 resize-none"
                        />
                        <p className="text-xs text-neutral-600">{promptRunnerText.length}/4000</p>
                      </div>

                      {/* Run button */}
                      <button
                        type="button"
                        onClick={runPrompt}
                        disabled={runningPrompt || !promptRunnerText.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {runningPrompt ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
                        ) : (
                          <><Play className="w-4 h-4" /> Run with Gemini</>
                        )}
                      </button>

                      {/* Error */}
                      {promptError && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                          <X className="w-4 h-4 shrink-0" />
                          {promptError}
                        </div>
                      )}

                      {/* Output */}
                      {promptRunnerOutput && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Gemini Output
                            </label>
                            <button
                              type="button"
                              onClick={() => setPromptRunnerOutput("")}
                              className="text-neutral-600 hover:text-neutral-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/20 text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                            {promptRunnerOutput}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
        </AnimatePresence>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            disabled={loading || !title || !category}
            className="h-12 px-10 text-base bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-500/50 text-violet-400 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Template
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
