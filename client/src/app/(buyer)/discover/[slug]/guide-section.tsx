"use client";

import { BookOpen, Clock, CheckCircle, Wrench, Target, TrendingUp, Users } from "lucide-react";

/** Display config for each guide / framework category. */
const CATEGORY_META: Record<string, { label: string; accent: string; icon: React.ReactNode }> = {
  "business-guide":         { label: "Business Guide",          accent: "text-blue-400 bg-blue-500/10 border-blue-500/30",     icon: <BookOpen className="w-4 h-4" /> },
  "automation-guide":       { label: "Automation Guide",        accent: "text-amber-400 bg-amber-500/10 border-amber-500/30",  icon: <BookOpen className="w-4 h-4" /> },
  "productivity-framework": { label: "Productivity Framework",  accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: <TrendingUp className="w-4 h-4" /> },
};

const COMPLEXITY_COLORS: Record<string, string> = {
  beginner:     "bg-emerald-500/80 text-white",
  intermediate: "bg-amber-500/80 text-white",
  advanced:     "bg-red-500/80 text-white",
};

const SCALABILITY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  personal:   { label: "Personal Use",     icon: <Target className="w-3.5 h-3.5" /> },
  team:       { label: "Team Use",         icon: <Users className="w-3.5 h-3.5" /> },
  enterprise: { label: "Enterprise Scale", icon: <TrendingUp className="w-3.5 h-3.5" /> },
};

interface Props {
  category: string;
  automationGuide?: {
    guideType?: string;
    complexity?: "beginner" | "intermediate" | "advanced";
    prerequisites?: string[];
    toolsRequired?: string[];
    estimatedTime?: string;
    outcomes?: string[];
    includesTemplates?: boolean;
  };
  productivityFramework?: {
    frameworkType?: string;
    methodology?: string;
    components?: string[];
    integrations?: string[];
    scalability?: "personal" | "team" | "enterprise";
    includesTemplates?: boolean;
    includesWorkflows?: boolean;
  };
}

/**
 * Buyer-facing metadata panel for guide and framework products.
 * Shown for: business-guide, automation-guide, productivity-framework.
 * For guide products: shows complexity, prerequisites, tools required, time and outcomes.
 * For framework products: shows methodology, components, integrations and scalability.
 * Returns null when no relevant metadata is present.
 */
export function GuideSection({ category, automationGuide, productivityFramework }: Props) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;

  const isFramework = category === "productivity-framework";
  const data = isFramework ? productivityFramework : automationGuide;

  if (!data) return null;

  const hasData = isFramework
    ? (productivityFramework?.components?.length ?? 0) > 0 || productivityFramework?.methodology
    : (automationGuide?.outcomes?.length ?? 0) > 0 || automationGuide?.complexity;

  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${meta.accent}`}>{meta.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-white">{meta.label} Details</h3>
          <p className="text-xs text-neutral-500">
            {isFramework ? "Framework methodology and components" : "What you'll learn and need"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {isFramework && productivityFramework ? (
          <>
            {/* Methodology */}
            {productivityFramework.methodology && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-neutral-400 mt-0.5 shrink-0">Methodology:</span>
                <span className="text-sm font-medium text-white">{productivityFramework.methodology}</span>
              </div>
            )}

            {/* Scalability */}
            {productivityFramework.scalability && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Designed for:</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 border border-neutral-700 text-neutral-200">
                  {SCALABILITY_LABELS[productivityFramework.scalability]?.icon}
                  {SCALABILITY_LABELS[productivityFramework.scalability]?.label}
                </span>
              </div>
            )}

            {/* Components */}
            {productivityFramework.components && productivityFramework.components.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Framework Components</p>
                <div className="flex flex-wrap gap-2">
                  {productivityFramework.components.map((c) => (
                    <span key={c} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations */}
            {productivityFramework.integrations && productivityFramework.integrations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Tool Integrations</p>
                <div className="flex flex-wrap gap-2">
                  {productivityFramework.integrations.map((i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800/70 text-neutral-300 border border-neutral-700/50">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {productivityFramework.includesTemplates && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-300">
                  ✦ Templates Included
                </span>
              )}
              {productivityFramework.includesWorkflows && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  ✦ Workflows Included
                </span>
              )}
            </div>
          </>
        ) : automationGuide ? (
          <>
            {/* Quick meta row */}
            <div className="grid grid-cols-2 gap-3">
              {automationGuide.complexity && (
                <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
                  <p className="text-xs text-neutral-500 mb-1">Difficulty</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${COMPLEXITY_COLORS[automationGuide.complexity]}`}>
                    {automationGuide.complexity.charAt(0).toUpperCase() + automationGuide.complexity.slice(1)}
                  </span>
                </div>
              )}
              {automationGuide.estimatedTime && (
                <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <p className="text-xs text-neutral-500">Est. Time</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{automationGuide.estimatedTime}</p>
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {automationGuide.prerequisites && automationGuide.prerequisites.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Prerequisites</p>
                <div className="flex flex-wrap gap-2">
                  {automationGuide.prerequisites.map((p) => (
                    <span key={p} className="px-3 py-1 rounded-full text-xs bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Required */}
            {automationGuide.toolsRequired && automationGuide.toolsRequired.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-neutral-400" />
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Tools Required</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {automationGuide.toolsRequired.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Outcomes */}
            {automationGuide.outcomes && automationGuide.outcomes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">What You'll Achieve</p>
                <ul className="space-y-1.5">
                  {automationGuide.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm text-neutral-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {automationGuide.includesTemplates && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-300">
                ✦ Templates Included
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
