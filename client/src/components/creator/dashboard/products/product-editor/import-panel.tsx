"use client";

import {
  FirecrawlScrapeRes,
  FirecrawlSearchRes,
  ProductRes,
  SearchResult,
} from "@/lib/types/product";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultRow } from "./result-row";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Sparkles,
  Loader2,
  FileText,
  Layout,
  Tag,
  ArrowRight,
  Check,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MODES = ["search", "scrape"] as const;
type Mode = (typeof MODES)[number];

function isMode(v: string): v is Mode {
  return (MODES as readonly string[]).includes(v);
}

function ImportPanel({
  productId,
  onAfterIngest,
}: {
  productId: string;
  onAfterIngest: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("search");
  const [loading, setLoading] = useState(false);

  // search state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // scrape states
  const [urlInput, setUrlInput] = useState("");
  const [summary, setSummary] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);

  async function onHandleSearch() {
    setLoading(true);
    setSearchResults([]);

    try {
      const res = await apiClient.post<FirecrawlSearchRes>(
        `/api/creator/products/${productId}/firecrawl/search`,
        {
          query,
          limit: 8,
        },
      );

      if (res?.data?.ok) {
        setSearchResults(res?.data.results ?? []);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function onRunQuickImport(url: string) {
    setLoading(true);
    setSearchResults([]);
    setSummary("");
    setSections([]);
    setPricingTiers([]);

    try {
      const res = await apiClient.post<FirecrawlScrapeRes>(
        `/api/creator/products/${productId}/firecrawl/scrape`,
        { url },
      );

      if (res?.data?.ok) {
        setSummary(res?.data?.extracted?.summary ?? "");
        setSections((res?.data?.extracted?.sections ?? []) as any[]);
        setPricingTiers((res?.data?.extracted?.pricingTiers ?? []) as any[]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function applyGeneratedToTemplate() {
    const desc = summary.trim();
    const cleanSections = Array.isArray(sections) ? sections : [];
    const cleanPricing = Array.isArray(pricingTiers) ? pricingTiers : [];

    if (!desc && cleanSections.length === 0 && cleanPricing.length === 0) return;

    setLoading(true);

    try {
      const res = await apiClient.patch<ProductRes>(
        `/api/creator/products/${productId}`,
        {
          ...(desc ? { description: desc } : {}),
          template: {
            page: {
              sections: cleanSections,
              pricingTiers: cleanPricing,
            },
          },
        },
      );

      if (!res.data.ok) throw new Error("Failed to apply generated content");
      await onAfterIngest();

      console.log(res);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  const hasResults = summary.trim() || sections.length > 0 || pricingTiers.length > 0;

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
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Page Builder</h2>
                  <p className="text-sm text-neutral-400">AI-powered page structure generator</p>
                </div>
                <Badge 
                  variant="secondary"
                  className="ml-2 bg-violet-500/20 text-violet-400 border-violet-500/30"
                >
                  AI Powered
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: "search", label: "Search", icon: Search },
          { id: "scrape", label: "Import & Generate", icon: Globe },
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = mode === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isMode(step.id) && setMode(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap backdrop-blur-md border ${
                isActive
                  ? "bg-neutral-900/30 border-violet-500/50 text-white"
                  : "bg-neutral-900/20 border-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-800/30"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isActive ? "bg-violet-500 text-white" : "bg-neutral-800 text-neutral-400"
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
        {/* Search Tab */}
        {mode === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-violet-400" />
                  Search Reference Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for reference pages (e.g., 'SaaS landing page', 'portfolio template')..."
                    className="flex-1 h-12 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                  />
                  <Button
                    disabled={loading || !query.trim()}
                    onClick={onHandleSearch}
                    className="h-12 px-6 bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="text-sm font-medium text-neutral-400 mb-4">
                        Found {searchResults.length} results
                      </h3>
                      <div className="grid gap-3">
                        {searchResults.map((res, index) => (
                          <Card
                            key={`${res.url}-${index}`}
                            className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md hover:border-neutral-700/50 transition-colors"
                          >
                            <CardContent className="p-4">
                              <ResultRow
                                title={res.title}
                                description={res.description}
                                url={res.url}
                                actions={
                                  <Button
                                    size="sm"
                                    disabled={loading}
                                    onClick={() => {
                                      setMode("scrape");
                                      setUrlInput(res.url);
                                      void onRunQuickImport(res.url);
                                    }}
                                    className="bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                                  >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Quick Import
                                  </Button>
                                }
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scrape Tab */}
        {mode === "scrape" && (
          <motion.div
            key="scrape"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Import URL Card */}
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-violet-400" />
                  Import from URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter URL to scrape (e.g., https://example.com)..."
                    className="flex-1 h-12 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-violet-500/50"
                  />
                  <Button
                    disabled={loading || !urlInput.trim()}
                    onClick={() => void onRunQuickImport(urlInput.trim())}
                    className="h-12 px-6 bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Importing..." : "Import"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Results Card */}
            <AnimatePresence>
              {hasResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-neutral-900/30 border-neutral-800/50 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                        Generated Page Structure
                      </CardTitle>
                      <Button
                        disabled={loading}
                        onClick={() => void applyGeneratedToTemplate()}
                        className="bg-violet-500/10 backdrop-blur-sm border border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Apply to Template
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      {summary.trim() && (
                        <div className="p-4 bg-neutral-900/30 backdrop-blur-sm rounded-xl border border-neutral-800/50">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-violet-400" />
                            <h4 className="text-sm font-medium text-white">Summary</h4>
                          </div>
                          <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                            {summary.trim()}
                          </p>
                        </div>
                      )}

                      {/* Sections */}
                      {Array.isArray(sections) && sections.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Layout className="w-4 h-4 text-pink-400" />
                            <h4 className="text-sm font-medium text-white">Suggested Sections</h4>
                          </div>
                          <div className="grid gap-3">
                            {sections.slice(0, 6).map((s: any, idx: number) => (
                              <div
                                key={`${s?.heading ?? "section"}-${idx}`}
                                className="p-4 bg-neutral-900/30 backdrop-blur-sm rounded-xl border border-neutral-800/50"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-medium">
                                    {idx + 1}
                                  </div>
                                  <div className="text-sm font-semibold text-white">
                                    {String(s?.heading ?? `Section ${idx + 1}`)}
                                  </div>
                                </div>
                                {Array.isArray(s?.bullets) && s.bullets.length ? (
                                  <ul className="ml-8 list-disc text-sm text-neutral-400 space-y-1">
                                    {s.bullets.slice(0, 6).map((b: any, i: number) => (
                                      <li key={`${idx}-${i}`}>{String(b)}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing Tiers */}
                      {Array.isArray(pricingTiers) && pricingTiers.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-400" />
                            <h4 className="text-sm font-medium text-white">Suggested Pricing Tiers</h4>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {pricingTiers.slice(0, 3).map((t: any, idx: number) => (
                              <div
                                key={`${t?.name ?? "tier"}-${idx}`}
                                className="p-4 bg-neutral-900/30 backdrop-blur-sm rounded-xl border border-neutral-800/50"
                              >
                                <div className="text-sm font-semibold text-white mb-1">
                                  {String(t?.name ?? `Tier ${idx + 1}`)}
                                </div>
                                <div className="text-lg font-bold text-violet-400 mb-2">
                                  {String(t?.price ?? "N/A")}
                                </div>
                                {Array.isArray(t?.details) && t.details.length ? (
                                  <ul className="list-disc text-sm text-neutral-400 space-y-1 pl-4">
                                    {t.details.slice(0, 6).map((d: any, i: number) => (
                                      <li key={`${idx}-d-${i}`}>{String(d)}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!hasResults && !loading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Import a reference URL
                </h3>
                <p className="text-neutral-400 max-w-md mx-auto">
                  Enter a URL above to generate summary, sections, and pricing ideas for your template page.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImportPanel;
