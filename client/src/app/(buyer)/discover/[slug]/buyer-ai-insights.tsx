"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import {
  TrendingUp, Star, Eye, ShoppingCart, Tag, Users, CheckCircle,
  AlertCircle, BarChart3, Lightbulb, Sparkles, ChevronDown, Loader2, X,
} from "lucide-react";

interface BuyerAIInsightsProps {
  product: {
    title: string;
    description: string;
    category?: string;
    features?: string[];
    tags?: string[];
    deliverables?: any[];
    price: number;
    stats?: {
      viewCount: number;
      soldCount: number;
      averageRating: number;
      reviewCount: number;
      conversionRate: number;
    };
    aiPromptPack?: {
      supportedModels?: string[];
      categories?: string[];
      prompts?: Array<{ label: string }>;
    };
  };
}

interface Insights {
  verdict: string;
  summary: string;
  strengths: string[];
  considerations: string[];
  bestFor: string[];
  valueScore: number;
  popularityScore: number;
  contentScore: number;
}

/**
 * Renders a horizontal score bar (0–100) with a percentage label.
 * @param value - Score from 0 to 100
 * @param color - Tailwind background class e.g. "bg-violet-500"
 */
function scoreBar(value: number, color: string) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-500 w-8 text-right">{pct}</span>
    </div>
  );
}

/** Maps Gemini verdict strings to their Tailwind colour classes for the badge. */
const VERDICT_STYLES: Record<string, { color: string; bg: string }> = {
  "Recommended":  { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "Good Value":   { color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/30" },
  "Niche Pick":   { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30" },
  "New Arrival":  { color: "text-neutral-400", bg: "bg-neutral-800/50 border-neutral-700/50" },
};

/**
 * AI Product Insights panel shown on the buyer product detail page.
 * Collapsed by default; clicking "Analyse Product" sends the product data
 * to POST /api/products/analyse which calls Gemini and returns structured
 * JSON insights (verdict, summary, scores, strengths, considerations, bestFor).
 * Results are cached in component state so re-opening doesn't re-call the API.
 */
export function BuyerAIInsights({ product }: BuyerAIInsightsProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const stats = product.stats;

  /** Calls the backend Gemini analysis endpoint and stores results in state. */
  const analyse = async () => {
    setLoading(true);
    setError(null);
    setRevealed(true);
    try {
      const res = await apiClient.post("/api/products/analyse", {
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        features: product.features,
        tags: product.tags,
        stats: product.stats,
        aiPromptPack: product.aiPromptPack,
      });
      if (res.data?.ok) {
        setInsights(res.data.insights);
      } else {
        setError(res.data?.error || "Failed to analyse product");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const verdictStyle = insights ? (VERDICT_STYLES[insights.verdict] ?? VERDICT_STYLES["New Arrival"]) : null;

  return (
    <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800/60">
        <Lightbulb className="w-4 h-4 text-violet-400 shrink-0" />
        <h3 className="text-sm font-semibold text-white">AI Product Insights</h3>
        {insights && verdictStyle && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-md border ${verdictStyle.bg} ${verdictStyle.color}`}>
            {insights.verdict}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!revealed ? (
            <button
              type="button"
              onClick={analyse}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md bg-violet-500/20 border border-violet-500/40 text-violet-200 hover:bg-violet-500/30 hover:border-violet-400/60 shadow-lg shadow-violet-500/10 transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Analyse Product
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700/50 hover:border-neutral-600 transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Collapse
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {revealed && (
        <div className="p-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-12 text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
              <span className="text-sm">Gemini is analysing this product...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Insights grid */}
          {!loading && insights && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left — scores + stats */}
              <div className="space-y-5">
                {/* Stat chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/40 p-3 text-center backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5 text-violet-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">{stats?.viewCount ?? 0}</div>
                    <div className="text-xs text-neutral-500">Views</div>
                  </div>
                  <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/40 p-3 text-center backdrop-blur-sm">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">{stats?.soldCount ?? 0}</div>
                    <div className="text-xs text-neutral-500">Sold</div>
                  </div>
                  <div className="rounded-xl bg-neutral-800/40 border border-neutral-700/40 p-3 text-center backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white">
                      {stats?.averageRating ? stats.averageRating.toFixed(1) : "—"}
                    </div>
                    <div className="text-xs text-neutral-500">{stats?.reviewCount ?? 0} reviews</div>
                  </div>
                </div>

                {/* AI score bars */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-violet-400" /> Popularity
                      </span>
                      <span className="text-xs font-medium text-violet-400">{insights.popularityScore}/100</span>
                    </div>
                    {scoreBar(insights.popularityScore, "bg-violet-500")}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-emerald-400" /> Content
                      </span>
                      <span className="text-xs font-medium text-emerald-400">{insights.contentScore}/100</span>
                    </div>
                    {scoreBar(insights.contentScore, "bg-emerald-500")}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Overall Value
                      </span>
                      <span className="text-xs font-medium text-amber-400">{insights.valueScore}/100</span>
                    </div>
                    {scoreBar(insights.valueScore, "bg-amber-500")}
                  </div>
                </div>

                {stats && stats.viewCount > 0 && (
                  <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
                    <span className="text-xs text-neutral-400">Conversion rate</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {((stats.soldCount / stats.viewCount) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Middle — summary + strengths/considerations */}
              <div className="space-y-4">
                <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                  <p className="text-xs text-neutral-300 leading-relaxed">{insights.summary}</p>
                </div>
                <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                  <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Strengths
                  </p>
                  <div className="space-y-1.5">
                    {insights.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-neutral-300">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {insights.considerations.length > 0 && (
                  <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                    <p className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Considerations
                    </p>
                    <div className="space-y-1.5">
                      {insights.considerations.map((c, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-neutral-300">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — best for + tags */}
              <div className="space-y-4">
                <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                  <p className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-pink-400" /> Best for
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.bestFor.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs backdrop-blur-md bg-pink-500/10 border border-pink-500/20 text-pink-300">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {product.aiPromptPack?.supportedModels && product.aiPromptPack.supportedModels.length > 0 && (
                  <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                    <p className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-violet-400" /> Compatible models
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.aiPromptPack.supportedModels.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs backdrop-blur-md bg-violet-500/10 border border-violet-500/20 text-violet-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="rounded-xl bg-neutral-800/30 border border-neutral-700/40 p-4 backdrop-blur-sm space-y-3">
                    <p className="text-xs font-medium text-neutral-400">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs backdrop-blur-md bg-neutral-700/50 border border-neutral-600/40 text-neutral-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
