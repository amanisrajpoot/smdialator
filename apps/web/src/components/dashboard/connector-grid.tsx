"use client";

import { useQuery } from "@tanstack/react-query";
import { PlugZap, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ConnectorInfo {
  platform: string;
  features: string[];
}

export function ConnectorGrid() {
  const { data } = useQuery({
    queryKey: ["connectors"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ConnectorInfo[] }>("/api/social/connectors");
      return response.data.data;
    },
    placeholderData: [
      { platform: "FACEBOOK_PAGE", features: ["SCHEDULING", "VIDEO", "BEST_TIME"] },
      { platform: "INSTAGRAM_BUSINESS", features: ["STORY", "REEL", "SCHEDULING"] },
      { platform: "LINKEDIN_PAGE", features: ["SCHEDULING", "CAROUSEL"] },
      { platform: "TIKTOK", features: ["VIDEO"] },
    ],
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
        <PlugZap className="h-5 w-5 text-brand-500" />
        <div>
          <h2 className="text-lg font-semibold">Connected platforms</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">OAuth tokens rotate automatically every 30 days.</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3 overflow-y-auto">
        {data?.map((connector) => (
          <li key={connector.platform} className="rounded-xl border border-slate-200 px-3 py-3 text-xs dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">{connector.platform.replace("_", " ")}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                Connected
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              {connector.features.slice(0, 4).map((feature) => (
                <span key={feature} className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  {feature.replace("_", " ")}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        OAuth tokens are encrypted at rest and rotated using n8n automations.
      </div>
    </div>
  );
}
