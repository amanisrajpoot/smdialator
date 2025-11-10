"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AnalyticsOverviewProps {
  data: {
    totals: {
      impressions: number;
      reach: number;
      engagements: number;
      clicks: number;
    };
    breakdown: Array<{
      profileId: string;
      _sum: {
        impressions: number | null;
        reach: number | null;
        engagements: number | null;
        clicks: number | null;
      };
    }>;
  };
}

const mockSeries = [
  { day: "Mon", impressions: 22000, reach: 16000, engagements: 3200 },
  { day: "Tue", impressions: 24500, reach: 18200, engagements: 4100 },
  { day: "Wed", impressions: 28000, reach: 21000, engagements: 4600 },
  { day: "Thu", impressions: 26500, reach: 19800, engagements: 4200 },
  { day: "Fri", impressions: 31000, reach: 23500, engagements: 5200 },
  { day: "Sat", impressions: 18000, reach: 14000, engagements: 2900 },
  { day: "Sun", impressions: 15000, reach: 12000, engagements: 2400 },
];

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cross-channel analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified metrics aggregated from Facebook, Instagram, LinkedIn, X, TikTok, Pinterest, YouTube, Google Business,
            Threads, Reddit, and Snapchat.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <p className="uppercase tracking-wide">Impressions</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{data?.totals.impressions.toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Reach</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{data?.totals.reach.toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Engagements</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{data?.totals.engagements.toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Clicks</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{data?.totals.clicks.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockSeries}>
            <defs>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEngagements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="impressions" stroke="#6366f1" fill="url(#colorImpressions)" strokeWidth={2} />
            <Area type="monotone" dataKey="engagements" stroke="#22c55e" fill="url(#colorEngagements)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
