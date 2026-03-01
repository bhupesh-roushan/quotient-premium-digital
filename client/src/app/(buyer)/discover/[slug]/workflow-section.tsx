"use client";

import { Settings, Clock, Wrench, Globe, GitBranch, Brain } from "lucide-react";

/** Display config for each workflow/automation category. */
const CATEGORY_META: Record<string, { label: string; accent: string }> = {
  "workflow-system":     { label: "Workflow System",      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  "automation-pipeline": { label: "Automation Pipeline",  accent: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  "ai-productivity":     { label: "AI Productivity Tool", accent: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
};

const INTEGRATION_COLORS: Record<string, string> = {
  basic:        "bg-neutral-600 text-neutral-200",
  intermediate: "bg-amber-500/80 text-white",
  advanced:     "bg-emerald-500/80 text-white",
};

const WORKFLOW_TYPE_LABELS: Record<string, string> = {
  automation:  "Automation",
  productivity:"Productivity",
  business:    "Business",
  ai:          "AI-Powered",
  integration: "Integration",
};

interface Props {
  category: string;
  workflowSystem?: {
    workflowType?: string;
    stepsCount?: number;
    tools?: string[];
    integrationLevel?: "basic" | "intermediate" | "advanced";
    timeToImplement?: string;
    platforms?: string[];
  };
}

/**
 * Buyer-facing metadata panel for workflow / automation products.
 * Shown for: workflow-system, automation-pipeline, ai-productivity.
 * Displays workflow type, steps count, tools used, integration complexity,
 * estimated implementation time, and supported platforms.
 * Returns null when no workflow metadata is present.
 */
export function WorkflowSection({ category, workflowSystem }: Props) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;

  const hasData =
    workflowSystem?.workflowType ||
    (workflowSystem?.tools?.length ?? 0) > 0 ||
    workflowSystem?.stepsCount;

  if (!hasData) return null;

  const wf = workflowSystem!;

  return (
    <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${meta.accent}`}>
          {category === "ai-productivity"
            ? <Brain className="w-4 h-4" />
            : <Settings className="w-4 h-4" />
          }
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">{meta.label} Details</h3>
          <p className="text-xs text-neutral-500">Automation capabilities and tools</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wf.workflowType && (
            <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
              <p className="text-xs text-neutral-500 mb-1">Type</p>
              <p className="text-sm font-semibold text-white">
                {WORKFLOW_TYPE_LABELS[wf.workflowType] ?? wf.workflowType}
              </p>
            </div>
          )}
          {wf.stepsCount !== undefined && wf.stepsCount > 0 && (
            <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
              <div className="flex items-center gap-1 mb-1">
                <GitBranch className="w-3 h-3 text-neutral-500" />
                <p className="text-xs text-neutral-500">Steps</p>
              </div>
              <p className="text-sm font-bold text-white">{wf.stepsCount}</p>
            </div>
          )}
          {wf.timeToImplement && (
            <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                <p className="text-xs text-neutral-500">Setup Time</p>
              </div>
              <p className="text-sm font-semibold text-white">{wf.timeToImplement}</p>
            </div>
          )}
        </div>

        {/* Tools */}
        {wf.tools && wf.tools.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wrench className="w-3.5 h-3.5 text-neutral-400" />
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Tools & Integrations</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {wf.tools.map((tool) => (
                <span key={tool} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200 border border-neutral-700">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms */}
        {wf.platforms && wf.platforms.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Platforms</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {wf.platforms.map((p) => (
                <span key={p} className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-800/70 text-neutral-300 border border-neutral-700/50">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integration level */}
        {wf.integrationLevel && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Integration Complexity:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${INTEGRATION_COLORS[wf.integrationLevel]}`}>
              {wf.integrationLevel.charAt(0).toUpperCase() + wf.integrationLevel.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
