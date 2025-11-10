"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workflow, Play, RefreshCw, ExternalLink, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { setAuthToken } from "@/lib/api";
import { WorkflowList } from "@/components/dashboard/workflow-list";
import Link from "next/link";

const workspaceId = process.env.NEXT_PUBLIC_DEMO_WORKSPACE_ID;
const n8nBaseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL;

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
}

export default function AutomationsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(workspaceId || null);

  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  const { data: workflows, isLoading, error, refetch } = useQuery<N8nWorkflow[]>({
    queryKey: ["n8n-workflows", selectedWorkspaceId],
    queryFn: async () => {
      if (!selectedWorkspaceId) {
        throw new Error("Workspace ID is required");
      }
      const { data } = await apiClient.get(`/api/automations/${selectedWorkspaceId}/automations/n8n/workflows`);
      return data.data;
    },
    enabled: Boolean(accessToken && selectedWorkspaceId),
    retry: 1,
  });

  const { data: savedAutomations } = useQuery({
    queryKey: ["automations", selectedWorkspaceId],
    queryFn: async () => {
      if (!selectedWorkspaceId) {
        return [];
      }
      const { data } = await apiClient.get(`/api/automations/${selectedWorkspaceId}/automations`);
      return data.data;
    },
    enabled: Boolean(accessToken && selectedWorkspaceId),
  });

  const triggerMutation = useMutation({
    mutationFn: async ({ automationId, payload }: { automationId: string; payload?: Record<string, unknown> }) => {
      if (!selectedWorkspaceId) {
        throw new Error("Workspace ID is required");
      }
      const { data } = await apiClient.post(
        `/api/automations/${selectedWorkspaceId}/automations/${automationId}/trigger`,
        payload || {}
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations", selectedWorkspaceId] });
    },
  });

  const triggerDirectMutation = useMutation({
    mutationFn: async ({ workflowId, payload }: { workflowId: string; payload?: Record<string, unknown> }) => {
      if (!selectedWorkspaceId) {
        throw new Error("Workspace ID is required");
      }
      const { data } = await apiClient.post(
        `/api/automations/${selectedWorkspaceId}/automations/n8n/workflows/${workflowId}/trigger`,
        { payload }
      );
      return data.data;
    },
  });

  const handleTriggerWorkflow = async (workflowId: string) => {
    // Find if there's a saved automation for this workflow
    const savedAutomation = savedAutomations?.find(
      (auto: { config?: Record<string, unknown> }) => auto.config?.workflowId === workflowId
    );

    if (savedAutomation) {
      await triggerMutation.mutateAsync({ automationId: savedAutomation.id });
    } else {
      // Trigger directly via n8n API
      await triggerDirectMutation.mutateAsync({ workflowId });
    }
  };

  const openN8nEditor = (workflowId: string) => {
    if (n8nBaseUrl) {
      window.open(`${n8nBaseUrl}/workflow/${workflowId}`, "_blank");
    } else {
      alert("N8N_BASE_URL is not configured. Cannot open workflow editor.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 p-6 dark:bg-slate-950">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Workflow Automations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and trigger your n8n workflows directly from the dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {n8nBaseUrl && (
            <a
              href={n8nBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open n8n Editor
            </a>
          )}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load workflows</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : "Make sure n8n is configured and accessible."}
            </p>
          </div>
        </div>
      )}

      {!selectedWorkspaceId && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Workspace not selected</p>
            <p className="text-sm">Please set NEXT_PUBLIC_DEMO_WORKSPACE_ID or select a workspace.</p>
          </div>
        </div>
      )}

      {!error && selectedWorkspaceId && (
        <div className="mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : workflows && workflows.length > 0 ? (
            <WorkflowList
              workflows={workflows}
              savedAutomations={savedAutomations || []}
              onTrigger={handleTriggerWorkflow}
              onOpenEditor={openN8nEditor}
              isTriggering={triggerMutation.isPending || triggerDirectMutation.isPending}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <Workflow className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No workflows found</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {n8nBaseUrl
                  ? "Create your first workflow in n8n to get started."
                  : "Configure n8n to start creating workflows."}
              </p>
              {n8nBaseUrl && (
                <a
                  href={n8nBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Create Workflow in n8n
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">About Workflow Automations</h2>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            This page displays all workflows from your connected n8n instance. You can trigger workflows manually,
            view their status, and open them in the n8n editor for configuration.
          </p>
          <p>
            Workflows can be triggered automatically based on events (like post published, draft created) or manually
            from this dashboard. Make sure to register workflows as automations in your workspace to enable automatic
            triggering.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
            <p className="text-xs">
              <strong>Tip:</strong> The APIs remain fully functional. You can use{" "}
              <code className="rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-700">
                GET /api/automations/:workspaceId/automations/n8n/workflows
              </code>{" "}
              to fetch workflows programmatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
