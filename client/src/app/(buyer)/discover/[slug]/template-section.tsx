"use client";

import { FileText, CheckCircle, Layers, Palette, BarChart3, Figma } from "lucide-react";

/** Icon and label mapping for each template category value. */
const TEMPLATE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "notion-template":        { label: "Notion Template",         icon: <FileText className="w-4 h-4" />,  color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  "resume-template":        { label: "Resume Template",         icon: <FileText className="w-4 h-4" />,  color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  "ui-kit":                 { label: "UI Kit",                  icon: <Palette className="w-4 h-4" />,   color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  "figma-assets":           { label: "Figma Assets",            icon: <Figma className="w-4 h-4" />,     color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  "productivity-dashboard": { label: "Productivity Dashboard",  icon: <BarChart3 className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
};

const CUSTOMIZATION_COLORS: Record<string, string> = {
  low:    "bg-neutral-600 text-neutral-200",
  medium: "bg-amber-500/80 text-white",
  high:   "bg-emerald-500/80 text-white",
};

interface Props {
  category: string;
  template?: {
    compatibility?: string[];
    features?: string[];
    customizationLevel?: "low" | "medium" | "high";
    includesAssets?: boolean;
  };
}

/**
 * Buyer-facing metadata panel for template-type products.
 * Shown for: notion-template, resume-template, ui-kit, figma-assets, productivity-dashboard.
 * Renders compatibility tools, feature tags, customization level, and asset inclusion badge.
 * Returns null if no template metadata is available.
 */
export function TemplateSectionDetails({ category, template }: Props) {
  const meta = TEMPLATE_META[category];

  if (!meta) return null;

  const hasData =
    (template?.compatibility?.length ?? 0) > 0 ||
    (template?.features?.length ?? 0) > 0 ||
    template?.customizationLevel;

  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${meta.color}`}>{meta.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-white">{meta.label} Details</h3>
          <p className="text-xs text-neutral-500">What's included with this template</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Compatibility */}
        {template?.compatibility && template.compatibility.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Compatible With</p>
            <div className="flex flex-wrap gap-2">
              {template.compatibility.map((tool) => (
                <span key={tool} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {template?.features && template.features.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Included Features</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {template.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Customization level + Asset badge */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {template?.customizationLevel && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-500" />
              <span className="text-xs text-neutral-400">Customization:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CUSTOMIZATION_COLORS[template.customizationLevel]}`}>
                {template.customizationLevel.charAt(0).toUpperCase() + template.customizationLevel.slice(1)}
              </span>
            </div>
          )}
          {template?.includesAssets && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-500/30 text-violet-300">
              ✦ Assets Included
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
