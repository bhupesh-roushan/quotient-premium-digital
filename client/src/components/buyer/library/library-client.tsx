"use client";

import { LibraryItem } from "@/app/(buyer)/library/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Download,
  Eye,
  X,
  FileCode,
  Image as ImageIcon,
  BookOpen,
  FolderOpen,
  ChevronRight,
  Calendar,
  IndianRupee,
  Play,
  Loader2,
  ExternalLink,
  Star,
  MessageSquare,
} from "lucide-react";

type Deliverable = {
  label: string;
  url: string;
  kind: "link" | "file" | "code";
};

type DeliverableRes = {
  ok: boolean;
  deliverables?: Deliverable[];
  installInstructions?: string;
  codeTemplate?: {
    codeFiles: Array<{
      filename: string;
      content: string;
    }>;
  };
  error?: string;
};

type AssetPreview = {
  _id: string;
  secureUrl: string;
  width: number;
  height: number;
  orderIndex: number;
};

type AssetRes = {
  ok: boolean;
  assets?: AssetPreview[];
  error?: string;
};

function formatDate(input: string | null) {
  if (!input) return "-";
  return new Date(input).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LibraryClient({ items }: { items: LibraryItem[] }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [assets, setAssets] = useState<AssetPreview[]>([]);
  const [installInstructions, setInstallInstructions] = useState<string>("");
  const [codeTemplate, setCodeTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<LibraryItem | null>(null);
  const [activeTab, setActiveTab] = useState("deliverables");
  const [previewItem, setPreviewItem] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([]);
  const [sandboxUrl, setSandboxUrl] = useState<string>("");
  const [runningCode, setRunningCode] = useState(false);

  useEffect(() => {
    // Filter deliverables to only show code and PDF files (not images)
    const filtered = deliverables.filter(d => {
      if (d.kind === 'code') return true;
      if (d.kind === 'file') {
        // Only include PDF files, not images
        const isPdf = d.label.toLowerCase().endsWith('.pdf') || d.url.toLowerCase().includes('.pdf');
        const isImage = d.url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
        return isPdf && !isImage;
      }
      return false; // Exclude links (images)
    });
    setAllDeliverables(filtered);
  }, [deliverables]);

  async function openItem(item: LibraryItem) {
    setActive(item);
    setDeliverables([]);
    setAssets([]);
    setInstallInstructions("");
    setCodeTemplate(null);
    setActiveTab("deliverables");
    setSandboxUrl("");
    setRunningCode(false);
    try {
      setLoading(true);
      const [deliverablesRes, assetsRes] = await Promise.all([
        apiClient.get<DeliverableRes>(
          `/api/library/${item.productId}/deliverables`,
        ),
        apiClient.get<AssetRes>(`/api/library/${item.productId}/assets`),
      ]);

      if (!deliverablesRes.data.ok)
        throw new Error("Failed to load deliverables");
      if (!assetsRes.data.ok) throw new Error("Failed to load assets");

      setDeliverables(deliverablesRes.data.deliverables ?? []);
      setInstallInstructions(deliverablesRes.data.installInstructions ?? "");
      setCodeTemplate(deliverablesRes.data.codeTemplate);
      setAssets(assetsRes.data.assets ?? []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  function handlePreview(url: string, label: string) {
    setPreviewItem({ url, label });
  }

  function handleDownload(url: string, label: string) {
    if (url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (url.includes("cloudinary.com")) {
      // For Cloudinary files, add fl_attachment to force download
      const downloadUrl = url.includes("/upload/")
        ? url.replace("/upload/", "/upload/fl_attachment/")
        : url;
      window.open(downloadUrl, "_blank");
    } else {
      window.open(url, "_blank");
    }
  }

  // StackBlitz code runner
  const createStackBlitzEmbed = (codeFiles: any[], framework: string = "react"): string => {
    const mainFile = codeFiles[0];
    const mainCode = mainFile?.content || "";
    const filename = mainFile?.filename || "App.js";
    const language = mainFile?.language || "tsx";
    
    // Determine file extension
    const ext = filename.split('.').pop() || 'js';
    
    // For React/JSX projects
    if (framework === "react" || language === "jsx" || language === "tsx" || ext === 'jsx' || ext === 'tsx') {
      // Keep user's code as-is, but ensure it has a default export
      const appContent = mainCode.includes('export default')
        ? mainCode
        : mainCode + '\n\nexport default App;';
      
      const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
      
      const packageJson = {
        name: "react-app",
        version: "0.1.0",
        private: true,
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1"
        },
        scripts: {
          start: "react-scripts start"
        }
      };
      
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
      
      // Encode all files for StackBlitz - using the same format as code-editor.tsx
      const files = {
        'package.json': encodeURIComponent(JSON.stringify(packageJson, null, 2)),
        'public/index.html': encodeURIComponent(indexHtml),
        'src/index.js': encodeURIComponent(indexContent),
        'src/App.js': encodeURIComponent(appContent)
      };
      
      // Use existing react-ts template and populate with files
      const fileParams = Object.entries(files)
        .map(([path, content]) => `file=${path}&content=${content}`)
        .join('&');
      
      return `https://stackblitz.com/edit/react-ts?embed=1&hideNavigation=1&theme=dark&${fileParams}`;
    }
    
    // For HTML
    if (framework === "html" || language === "html" || ext === 'html') {
      const encodedCode = encodeURIComponent(mainCode);
      return `https://stackblitz.com/edit/web-platform?embed=1&hideNavigation=1&theme=dark&file=index.html&content=${encodedCode}`;
    }
    
    // Default JavaScript
    const encodedCode = encodeURIComponent(mainCode);
    return `https://stackblitz.com/edit/js?embed=1&hideNavigation=1&theme=dark&file=index.js&content=${encodedCode}`;
  };

  const handleRunCode = async () => {
    if (!codeTemplate?.codeFiles?.length) return;
    
    setRunningCode(true);
    try {
      const framework = codeTemplate.framework || "react";
      const url = createStackBlitzEmbed(codeTemplate.codeFiles, framework);
      setSandboxUrl(url);
    } catch (err) {
      console.error("Failed to create sandbox:", err);
    } finally {
      setRunningCode(false);
    }
  };

  const openInStackBlitz = () => {
    if (sandboxUrl) {
      window.open(sandboxUrl.replace("embed=1", "embed=0"), "_blank");
    }
  };

  function safeBase64Decode(base64: string): string | null {
    try {
      let decodedBase64 = base64;
      if (base64.includes('%')) {
        try {
          decodedBase64 = decodeURIComponent(base64);
        } catch (urlError) {
          console.log('URL decode failed, using original:', urlError);
        }
      }

      const codeIndicators = ['{', '}', ';', '(', ')', '\n', '  ', 'var ', 'const ', 'let ', 'function'];
      const hasCodeIndicators = codeIndicators.some(indicator => decodedBase64.includes(indicator));
      
      if (hasCodeIndicators && !decodedBase64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        return decodedBase64;
      }

      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      
      if (!base64Regex.test(decodedBase64)) {
        const invalidChars = decodedBase64.match(/[^A-Za-z0-9+/=]/g);
        console.error('Invalid base64 format:', invalidChars);
        return null;
      }
      
      if (decodedBase64.length % 4 !== 0) {
        return null;
      }
      
      const decoded = atob(decodedBase64);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  const fileDeliverables = allDeliverables.filter(d => d.kind === 'file');
  const codeDeliverables = allDeliverables.filter(d => d.kind === 'code');
  
  const hasFiles = fileDeliverables.length > 0 || codeDeliverables.length > 0;
  const hasCode = codeTemplate?.codeFiles?.length > 0 || deliverables.some(d => d.kind === 'code');
  const hasPreview = assets.length > 0;
  const hasInstructions = installInstructions.trim().length > 0;

  const tabs = [
    { id: 'preview', label: 'Preview', icon: ImageIcon, show: hasPreview },
    { id: 'deliverables', label: 'Files', icon: FolderOpen, show: hasFiles },
    { id: 'code', label: 'Code', icon: FileCode, show: hasCode },
    { id: 'instructions', label: 'Instructions', icon: BookOpen, show: hasInstructions },
  ].filter(tab => tab.show);

  if (!items.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
              <Package className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Your library is empty
            </h2>
            <p className="text-neutral-400 mb-6">
              You haven't purchased any templates yet. Explore the marketplace to find amazing digital products.
            </p>
            <Button
              asChild
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white transition-all"
            >
              <Link href="/discover">
                Discover Templates
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm hover:border-neutral-700 transition-all cursor-pointer group"
              onClick={() => openItem(item)}
            >
              <CardContent className="p-6">
                {/* Cover Image */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-neutral-900/50 mb-4">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={`${item.title} cover`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="inline-block px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full mt-1 capitalize">
                        {item.category.replace(/-/g, ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-violet-400 text-sm font-medium ml-2">
                    <span>View</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm text-neutral-400 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.paidAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      <span>{item.price}</span>
                    </div>
                  </div>
                  {item.stats?.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">
                        {item.stats.averageRating.toFixed(1)}
                      </span>
                      {item.stats.reviewCount > 0 && (
                        <span className="text-neutral-500">
                          ({item.stats.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Stats */}
                {item.stats && (
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    {item.stats.viewCount > 0 && (
                      <span>{item.stats.viewCount} views</span>
                    )}
                    {item.stats.soldCount > 0 && (
                      <span>{item.stats.soldCount} sold</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setActive(null)}
            />

            {/* Close Button - Red Glassmorphic */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive(null);
              }}
              className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm flex items-center justify-center">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{active.title}</h2>
                        <p className="text-neutral-400">
                          Purchased on {formatDate(active.paidAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Write Review Button */}
                    <Link
                      href={`/discover/${active.productId}#reviews`}
                      onClick={() => setActive(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 backdrop-blur-sm border border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-yellow-400 rounded-xl font-medium transition-all"
                    >
                      <Star className="w-4 h-4" />
                      Write Review
                    </Link>
                  </div>
                </div>

                {/* Tabs */}
                {tabs.length > 0 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            isActive
                              ? "bg-neutral-800/50 backdrop-blur-sm border border-violet-500/50 text-white"
                              : "bg-neutral-900/30 backdrop-blur-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Content */}
                <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-neutral-400">Loading content...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Files Tab */}
                      {activeTab === 'deliverables' && hasFiles && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-neutral-950/50 rounded-xl p-4 text-center">
                              <div className="text-2xl font-bold text-violet-400">
                                {fileDeliverables.length}
                              </div>
                              <div className="text-sm text-neutral-400">PDF Files</div>
                            </div>
                            <div className="bg-neutral-950/50 rounded-xl p-4 text-center">
                              <div className="text-2xl font-bold text-blue-400">
                                {codeDeliverables.length}
                              </div>
                              <div className="text-sm text-neutral-400">Code Files</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fileDeliverables.map((d, idx) => (
                              <div
                                key={`file-${idx}`}
                                className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">
                                      {d.label || `PDF ${idx + 1}`}
                                    </h4>
                                    <span className="inline-block px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full mt-1 uppercase">
                                      PDF
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreview(d.url, d.label || `pdf-${idx + 1}`);
                                    }}
                                    className="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(d.url, d.label || `pdf-${idx + 1}.pdf`);
                                    }}
                                    className="flex-1 px-3 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            ))}
                            {codeDeliverables.map((d, idx) => (
                              <div
                                key={`code-${idx}`}
                                className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">
                                      {d.label || `Code ${idx + 1}`}
                                    </h4>
                                    <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full mt-1 uppercase">
                                      Code
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreview(d.url, d.label || `code-${idx + 1}`);
                                    }}
                                    className="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(d.url, d.label || `code-${idx + 1}`);
                                    }}
                                    className="flex-1 px-3 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview Tab */}
                      {activeTab === 'preview' && hasPreview && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assets.map((asset) => (
                            <div
                              key={asset._id}
                              className="bg-neutral-950/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors"
                            >
                              <div className="aspect-video bg-neutral-900">
                                <Image
                                  src={asset.secureUrl}
                                  alt="Preview"
                                  width={asset.width || 400}
                                  height={asset.height || 300}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <button
                                  onClick={() => handleDownload(asset.secureUrl, `preview-${asset._id}`)}
                                  className="w-full px-4 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download Image
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Code Tab */}
                      {activeTab === 'code' && hasCode && (
                        <div className="space-y-6">
                          {/* Run Code Button */}
                          {codeTemplate?.codeFiles?.length > 0 && (
                            <div className="flex gap-3">
                              <button
                                onClick={handleRunCode}
                                disabled={runningCode}
                                className="flex items-center gap-2 px-6 py-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                              >
                                {runningCode ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Play className="w-5 h-5" />
                                )}
                                {runningCode ? "Starting..." : "Run Code"}
                              </button>
                              {sandboxUrl && (
                                <button
                                  onClick={openInStackBlitz}
                                  className="flex items-center gap-2 px-4 py-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white rounded-xl font-medium transition-all"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Open in StackBlitz
                                </button>
                              )}
                            </div>
                          )}

                          {/* StackBlitz Preview */}
                          {sandboxUrl && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl overflow-hidden">
                              <div className="px-4 py-3 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Play className="w-4 h-4 text-green-400" />
                                  <span className="text-white font-medium">Live Preview</span>
                                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-xs rounded-full">
                                    StackBlitz
                                  </span>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="mb-3 p-3 bg-green-500/10 rounded-lg text-sm">
                                  <p className="text-green-400">
                                    Your code is running in a live sandbox environment powered by StackBlitz.
                                  </p>
                                </div>
                                <div className="border border-neutral-800 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                                  <iframe
                                    src={sandboxUrl}
                                    className="w-full h-full"
                                    title="StackBlitz Preview"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
                                    allowFullScreen
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Code Files */}
                          <div className="space-y-4">
                            {codeTemplate?.codeFiles?.map((file: any, idx: number) => (
                              <div key={idx} className="bg-neutral-950/50 border border-neutral-800 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-violet-400" />
                                    <span className="text-white font-medium">{file.filename}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const blob = new Blob([file.content], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = file.filename;
                                      link.click();
                                      URL.revokeObjectURL(url);
                                    }}
                                    className="px-3 py-1.5 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-violet-400 text-sm rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </div>
                                <div className="p-4">
                                  <pre className="text-sm bg-neutral-900/50 p-4 rounded-lg overflow-x-auto max-h-96 font-mono text-green-400">
                                    {file.content}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructions Tab */}
                      {activeTab === 'instructions' && hasInstructions && (
                        <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-violet-400" />
                            Installation & Usage
                          </h3>
                          <pre className="whitespace-pre-wrap text-sm text-neutral-300 bg-neutral-900/50 p-4 rounded-lg overflow-x-auto">
                            {installInstructions}
                          </pre>
                        </div>
                      )}

                      {/* Empty State */}
                      {!loading && activeTab === 'deliverables' && !hasFiles && (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-neutral-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            No files available
                          </h3>
                          <p className="text-neutral-400">
                            Check other tabs for content
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setPreviewItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h3 className="text-lg font-semibold text-white truncate pr-4">
                  {previewItem.label}
                </h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[70vh] overflow-auto">
                {(() => {
                  if (previewItem.url.startsWith("data:") && previewItem.url.includes(',')) {
                    const base64Part = previewItem.url.split(',')[1];
                    if (base64Part) {
                      const decoded = safeBase64Decode(base64Part);
                      if (decoded !== null) {
                        return (
                          <pre className="whitespace-pre-wrap text-sm bg-neutral-950 p-4 rounded-lg overflow-x-auto font-mono text-green-400">
                            {decoded}
                          </pre>
                        );
                      }
                    }
                    return (
                      <div className="text-center py-8">
                        <p className="text-neutral-400">Content could not be decoded</p>
                      </div>
                    );
                  } else if (previewItem.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                    return (
                      <div className="flex justify-center">
                        <Image
                          src={previewItem.url}
                          alt={previewItem.label}
                          width={800}
                          height={600}
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <p className="text-neutral-400 mb-4">
                          This file type cannot be previewed
                        </p>
                        <button
                          onClick={() => handleDownload(previewItem.url, previewItem.label)}
                          className="px-6 py-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-700/50 hover:border-violet-500/50 text-white rounded-lg transition-colors"
                        >
                          Download File
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LibraryClient;
