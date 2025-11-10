"use client";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Calendar, BarChart3, Activity, Zap, CloudUpload } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/api";
import { DashboardCalendar } from "@/components/dashboard/calendar";
import { ConnectorGrid } from "@/components/dashboard/connector-grid";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";

const workspaceId = process.env.NEXT_PUBLIC_DEMO_WORKSPACE_ID;

export default function DashboardPage() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error("Set NEXT_PUBLIC_DEMO_WORKSPACE_ID to enable analytics requests.");
      }
      const { data } = await apiClient.get(`/api/analytics/${workspaceId}/overview`);
      return data.data;
    },
    enabled: Boolean(accessToken && workspaceId),
    placeholderData: {
      totals: {
        impressions: 128000,
        reach: 84000,
        engagements: 15700,
        clicks: 8900,
      },
      breakdown: [],
    },
  });

  const analyticsData =
    overview ?? {
      totals: {
        impressions: 128000,
        reach: 84000,
        engagements: 15700,
        clicks: 8900,
      },
      breakdown: [],
    };

  const cards = [
    {
      label: "Scheduled posts",
      value: "32",
      change: "+12% vs last week",
      icon: Calendar,
    },
    {
      label: "Audience engagements",
      value: analyticsData.totals.engagements.toLocaleString(),
      change: "+8.1% vs last week",
      icon: Activity,
    },
    {
      label: "AI suggestions used",
      value: "68",
      change: "+22% adoption",
      icon: Zap,
    },
    {
      label: "Assets uploaded",
      value: "412",
      change: "+45 this week",
      icon: CloudUpload,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 p-6 dark:bg-slate-950">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Engagement overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Week of {dayjs().startOf("week").format("MMM D")} – {dayjs().endOf("week").format("MMM D, YYYY")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <BarChart3 className="h-4 w-4" />
          Data is refreshed hourly from native social APIs.
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
              </div>
              <card.icon className="h-10 w-10 text-brand-500" />
            </div>
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{card.change}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <DashboardCalendar />
        <ConnectorGrid />
      </section>

      <section className="mt-8">
        <AnalyticsOverview data={analyticsData} />
      </section>
    </div>
  );
}
