"use client";

import { Play, ExternalLink, CheckCircle2, XCircle, Tag, Zap } from "lucide-react";
import { useState } from "react";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
}

interface SavedAutomation {
  id: string;
  name: string;
  config?: Record<string, unknown>;
  isActive: boolean;
}

interface WorkflowCardProps {
  workflow: N8nWorkflow;
  savedAutomation?: SavedAutomation;
  onTrigger: (workflowId: string) => Promise<void>;
  onOpenEditor: (workflowId: string) => void;
  isTriggering: boolean;
}

export function WorkflowCard({
  workflow,
  savedAutomation,
  onTrigger,
  onOpenEditor,
  isTriggering,
}: WorkflowCardProps) {
  const [isTriggeringLocal, setIsTriggeringLocal] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  const handleTrigger = async () => {
    setIsTriggeringLocal(true);
    setTriggerError(null);
    setTriggerSuccess(false);

    try {
      await onTrigger(workflow.id);
      setTriggerSuccess(true);
      setTimeout(() => setTriggerSuccess(false), 3000);
    } catch (error) {
      setTriggerError(error instanceof Error ? error.message : "Failed to trigger workflow");
      setTimeout(() => setTriggerError(null), 5000);
    } finally {
      setIsTriggeringLocal(false);
    }
  };

  const canTrigger = savedAutomation !== undefined;

  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${
        workflow.active
          ? "border-emerald-200 dark:border-emerald-800"
          : "border-slate-200 dark:border-slate-800 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{workflow.name}</h3>
            {workflow.active ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {workflow.id}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            workflow.active
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {workflow.active ? "Active" : "Inactive"}
        </span>
      </div>

      {workflow.tags && workflow.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {savedAutomation && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Zap className="h-3 w-3 text-brand-500" />
          <span>Registered as automation: {savedAutomation.name}</span>
        </div>
      )}

      {triggerSuccess && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          Workflow triggered successfully!
        </div>
      )}

      {triggerError && (
        <div className="mt-4 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {triggerError}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleTrigger}
          disabled={isTriggering || isTriggeringLocal || !workflow.active}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className={`h-4 w-4 ${isTriggering || isTriggeringLocal ? "animate-pulse" : ""}`} />
          {isTriggering || isTriggeringLocal ? "Triggering..." : "Trigger"}
        </button>
        <button
          onClick={() => onOpenEditor(workflow.id)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ExternalLink className="h-4 w-4" />
          Edit
        </button>
      </div>
    </div>
  );
}
