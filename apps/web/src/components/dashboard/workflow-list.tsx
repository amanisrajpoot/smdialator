"use client";

import { WorkflowCard } from "./workflow-card";
import { Workflow } from "lucide-react";

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

interface WorkflowListProps {
  workflows: N8nWorkflow[];
  savedAutomations: SavedAutomation[];
  onTrigger: (workflowId: string) => Promise<void>;
  onOpenEditor: (workflowId: string) => void;
  isTriggering: boolean;
}

export function WorkflowList({ workflows, savedAutomations, onTrigger, onOpenEditor, isTriggering }: WorkflowListProps) {
  const activeWorkflows = workflows.filter((w) => w.active);
  const inactiveWorkflows = workflows.filter((w) => !w.active);

  return (
    <div className="space-y-8">
      {activeWorkflows.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Active Workflows</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeWorkflows.map((workflow) => {
              const savedAutomation = savedAutomations.find(
                (auto) => auto.config?.workflowId === workflow.id
              );
              return (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  savedAutomation={savedAutomation}
                  onTrigger={onTrigger}
                  onOpenEditor={onOpenEditor}
                  isTriggering={isTriggering}
                />
              );
            })}
          </div>
        </section>
      )}

      {inactiveWorkflows.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Inactive Workflows</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactiveWorkflows.map((workflow) => {
              const savedAutomation = savedAutomations.find(
                (auto) => auto.config?.workflowId === workflow.id
              );
              return (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  savedAutomation={savedAutomation}
                  onTrigger={onTrigger}
                  onOpenEditor={onOpenEditor}
                  isTriggering={isTriggering}
                />
              );
            })}
          </div>
        </section>
      )}

      {workflows.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Workflow className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No workflows found</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create your first workflow in n8n to get started.
          </p>
        </div>
      )}
    </div>
  );
}
