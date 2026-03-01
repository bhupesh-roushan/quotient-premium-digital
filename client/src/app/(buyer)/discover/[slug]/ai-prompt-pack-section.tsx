"use client";

import { useState } from "react";
import { Bot, Zap, Lock, ShoppingCart, Play, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

/** Display labels and emoji icons for known AI platform/model identifiers. */
const PLATFORM_LABELS: Record<string, { label: string; icon: string }> = {
  chatgpt: { label: "ChatGPT", icon: "🤖" },
  claude: { label: "Claude", icon: "🧠" },
  gemini: { label: "Gemini", icon: "✨" },
  midjourney: { label: "Midjourney", icon: "🎨" },
  "dall-e": { label: "DALL·E", icon: "🖼️" },
  "stable-diffusion": { label: "Stable Diffusion", icon: "🌊" },
  llama: { label: "Llama", icon: "🦙" },
  mistral: { label: "Mistral", icon: "💨" },
  perplexity: { label: "Perplexity", icon: "🔍" },
  grok: { label: "Grok", icon: "⚡" },
};

/** Human-readable labels for prompt pack use-case categories. */
const USE_CASE_LABELS: Record<string, string> = {
  marketing: "Marketing",
  coding: "Coding",
  writing: "Writing",
  art: "Art & Design",
  business: "Business",
  productivity: "Productivity",
  sales: "Sales",
  education: "Education",
  seo: "SEO",
  "social-media": "Social Media",
};

interface Props {
  productId: string;
  aiPromptPack?: {
    supportedModels?: string[];
    categories?: string[];
    difficulty?: string;
    prompts?: Array<{ label: string }>;
  };
  isPurchased: boolean;
}

/**
 * Buyer-facing AI Prompt Pack details section on the product detail page.
 * Shows supported models, use-case categories, and a list of individual prompts.
 * Purchased users can run each prompt live through Gemini via the prompt runner.
 * Non-purchasers see a lock overlay prompting them to buy.
 * Returns null if the product has no aiPromptPack data.
 */
export function AiPromptPackSection({ productId, aiPromptPack, isPurchased }: Props) {
  const [runningIdx, setRunningIdx] = useState<number | null>(null);
  const [outputs, setOutputs] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  /**
   * Runs a single prompt from the pack by its index.
   * Posts to /api/prompt-runner/product/:productId — the server retrieves the
   * actual prompt content and runs it through Gemini, returning only the output.
   * The raw prompt content is never exposed to the client.
   */
  const runPrompt = async (idx: number) => {
    setRunningIdx(idx);
    setOutputs(prev => ({ ...prev, [idx]: "" }));
    setErrors(prev => ({ ...prev, [idx]: "" }));
    try {
      const res = await apiClient.post(`/api/prompt-runner/product/${productId}`, { promptIndex: idx });
      if (res?.data?.ok) {
        setOutputs(prev => ({ ...prev, [idx]: res.data.output }));
      } else {
        setErrors(prev => ({ ...prev, [idx]: res?.data?.error || "Failed to run prompt" }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [idx]: err?.response?.data?.error || "Network error" }));
    } finally {
      setRunningIdx(null);
    }
  };

  if (!aiPromptPack) return null;

  const { supportedModels = [], categories = [], prompts = [] } = aiPromptPack;
  const hasData = supportedModels.length > 0 || categories.length > 0 || prompts.length > 0;
  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
        <Bot className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">AI Prompt Pack Details</h3>
        <span className="ml-auto px-2.5 py-1 rounded-full text-xs backdrop-blur-md bg-violet-500/15 border border-violet-500/30 text-violet-300 shadow-sm shadow-violet-500/20">
          🤖 AI Powered
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Compatible Platforms */}
        {supportedModels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              Works with these AI platforms
            </div>
            <div className="flex flex-wrap gap-2">
              {supportedModels.map((model) => {
                const info = PLATFORM_LABELS[model];
                return (
                  <span
                    key={model}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 border border-violet-500/30 text-violet-300"
                  >
                    {info?.icon ?? "🤖"} {info?.label ?? model}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Perfect for
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((uc) => (
                <span
                  key={uc}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300"
                >
                  {USE_CASE_LABELS[uc] ?? uc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Runner — shows labels, hides actual prompt content */}
        {prompts.length > 0 ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-500/10 flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">
                Try the Prompts — Free Preview
              </span>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Powered by Gemini
              </span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-neutral-500">
                Run any prompt from this pack to see real AI output. The actual prompt text is hidden — purchase to access the full prompts.
              </p>
              {prompts.map((prompt, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600 font-mono">#{idx + 1}</span>
                      <span className="text-xs font-medium text-white">
                        {prompt.label || `Prompt ${idx + 1}`}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-600">
                        <Lock className="w-2.5 h-2.5" />
                        Content hidden
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => runPrompt(idx)}
                      disabled={runningIdx !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {runningIdx === idx ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Running...</>
                      ) : (
                        <><Play className="w-3 h-3" /> Run</>
                      )}
                    </button>
                  </div>
                  {errors[idx] && (
                    <div className="flex items-center gap-2 px-3 py-2 text-red-400 text-xs">
                      <X className="w-3 h-3 shrink-0" />{errors[idx]}
                    </div>
                  )}
                  {outputs[idx] && (
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Gemini Output
                        </span>
                        <button
                          type="button"
                          onClick={() => setOutputs(prev => ({ ...prev, [idx]: "" }))}
                          className="text-neutral-600 hover:text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                        {outputs[idx]}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Fallback locked preview when no prompts set yet */
          <div className="relative rounded-xl border border-neutral-700 overflow-hidden">
            <div className="p-4 space-y-2 filter blur-sm select-none pointer-events-none" aria-hidden>
              <p className="text-xs text-neutral-400 font-mono">Act as an expert [role] and help me with...</p>
              <p className="text-xs text-neutral-500 font-mono">Structure your response with clear sections...</p>
              <p className="text-xs text-neutral-600 font-mono">Always consider [context] before answering...</p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-[2px] gap-2">
              {isPurchased ? (
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Full prompts available in your Library
                </p>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <p className="text-xs text-neutral-400 font-medium">Purchase to access all prompts</p>
                  <div className="flex items-center gap-1 text-xs text-violet-400">
                    <ShoppingCart className="w-3 h-3" />
                    Instant delivery after purchase
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
