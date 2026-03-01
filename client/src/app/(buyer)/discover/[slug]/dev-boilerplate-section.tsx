"use client";

import { Zap, CheckCircle, XCircle, Code2, Server, Database, ShieldCheck, TestTube2, Rocket, BookOpen } from "lucide-react";

/** Human-readable labels and accent colours for each developer starter category. */
const CATEGORY_META: Record<string, { label: string; accent: string }> = {
  "dev-boilerplate":       { label: "Developer Boilerplate", accent: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  "mern-starter":          { label: "MERN Starter",          accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  "auth-system":           { label: "Auth System",           accent: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  "saas-starter":          { label: "SaaS Starter",          accent: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  "api-scaffold":          { label: "API Scaffold",          accent: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  "react-template":        { label: "React Template",        accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  "vue-template":          { label: "Vue Template",          accent: "text-green-400 bg-green-500/10 border-green-500/30" },
  "angular-template":      { label: "Angular Template",      accent: "text-red-400 bg-red-500/10 border-red-500/30" },
  "javascript-component":  { label: "JavaScript Component",  accent: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  "typescript-component":  { label: "TypeScript Component",  accent: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  "css-template":          { label: "CSS Template",          accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30" },
  "html-template":         { label: "HTML Template",         accent: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
};

const ARCHITECTURE_LABELS: Record<string, string> = {
  mvc:          "MVC",
  spa:          "SPA",
  fullstack:    "Full-Stack",
  microservices:"Microservices",
  serverless:   "Serverless",
};

interface FeatureFlagProps {
  icon: React.ReactNode;
  label: string;
  included: boolean;
}

/** Single included/excluded feature row with coloured icon. */
function FeatureFlag({ icon, label, included }: FeatureFlagProps) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className={included ? "text-emerald-400" : "text-neutral-600"}>{icon}</span>
      <span className={included ? "text-neutral-200" : "text-neutral-500 line-through"}>{label}</span>
      {included
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-neutral-600 ml-auto shrink-0" />
      }
    </div>
  );
}

interface Props {
  category: string;
  developerBoilerplate?: {
    techStack?: string[];
    architecture?: string;
    includesAuth?: boolean;
    includesDatabase?: boolean;
    includesTesting?: boolean;
    deploymentReady?: boolean;
    documentation?: boolean;
    starterType?: string;
  };
}

/**
 * Buyer-facing metadata panel for developer boilerplate / code template products.
 * Shown for: dev-boilerplate, mern-starter, auth-system, saas-starter, api-scaffold,
 * react-template, vue-template, angular-template, javascript-component,
 * typescript-component, css-template, html-template.
 * Displays tech stack pills, architecture badge, and a feature checklist.
 * Returns null when no developer boilerplate metadata exists.
 */
export function DevBoilerplateSection({ category, developerBoilerplate }: Props) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;

  const hasData =
    (developerBoilerplate?.techStack?.length ?? 0) > 0 ||
    developerBoilerplate?.architecture ||
    developerBoilerplate?.includesAuth !== undefined;

  if (!hasData) return null;

  const db = developerBoilerplate!;

  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${meta.accent}`}>
          <Code2 className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">{meta.label} Details</h3>
          <p className="text-xs text-neutral-500">Tech stack and what's included</p>
        </div>
        {db.starterType && (
          <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 border border-neutral-700 text-neutral-200 uppercase tracking-wide">
            {db.starterType}
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Tech Stack */}
        {db.techStack && db.techStack.length > 0 && (
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {db.techStack.map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Architecture */}
        {db.architecture && (
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-neutral-500" />
            <span className="text-xs text-neutral-400">Architecture:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300">
              {ARCHITECTURE_LABELS[db.architecture] ?? db.architecture}
            </span>
          </div>
        )}

        {/* Feature checklist */}
        {(db.includesAuth !== undefined ||
          db.includesDatabase !== undefined ||
          db.includesTesting !== undefined ||
          db.deploymentReady !== undefined ||
          db.documentation !== undefined) && (
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wider">Includes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {db.includesAuth !== undefined && (
                <FeatureFlag icon={<ShieldCheck className="w-4 h-4" />} label="Authentication" included={!!db.includesAuth} />
              )}
              {db.includesDatabase !== undefined && (
                <FeatureFlag icon={<Database className="w-4 h-4" />} label="Database Setup" included={!!db.includesDatabase} />
              )}
              {db.includesTesting !== undefined && (
                <FeatureFlag icon={<TestTube2 className="w-4 h-4" />} label="Tests / Test Suite" included={!!db.includesTesting} />
              )}
              {db.deploymentReady !== undefined && (
                <FeatureFlag icon={<Rocket className="w-4 h-4" />} label="Deployment Ready" included={!!db.deploymentReady} />
              )}
              {db.documentation !== undefined && (
                <FeatureFlag icon={<BookOpen className="w-4 h-4" />} label="Documentation" included={!!db.documentation} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
