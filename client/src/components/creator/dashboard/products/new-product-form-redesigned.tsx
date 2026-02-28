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
} from "lucide-react";

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
  
  const selectedCategory = categories.find(c => c.value === category);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const productData: any = {
        title,
        price,
        category,
        description: description || `A high-quality ${category?.replace('-', ' ')} for creators and professionals.`,
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

              {/* Description only - no code template preview */}
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
