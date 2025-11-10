import Link from "next/link";
import { ArrowRight, Calendar, Brain, LineChart, PlugZap } from "lucide-react";

const features = [
  {
    title: "Unified Planner",
    description: "Drag-and-drop calendar with bulk scheduling, best-time suggestions, and multi-channel previews.",
    icon: Calendar,
  },
  {
    title: "AI Co-Pilot",
    description: "Generate, rewrite, or localize posts instantly with provider choice (OpenAI, Anthropic, Vertex).",
    icon: Brain,
  },
  {
    title: "Deep Analytics",
    description: "Cross-network dashboards, campaign KPI tracking, and scheduled executive summaries.",
    icon: LineChart,
  },
  {
    title: "Workflow Automation",
    description: "Connect n8n, webhooks, or custom scripts to trigger posts, approvals, and notifications.",
    icon: PlugZap,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-brand-300">
            Social Media Operations OS
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Schedule, collaborate, and analyze every channel from one command center.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Omni Social Scheduler unifies publishing across Facebook, Instagram, LinkedIn, X, TikTok, Pinterest, YouTube,
            Google Business, Threads, Reddit, and more. AI-assisted content, multi-step approvals, automation with n8n,
            and deep analytics included.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400"
            >
              Enter Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-white transition hover:border-white/40"
            >
              View API Docs
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <feature.icon className="h-8 w-8 text-brand-300" />
              <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-r from-brand-500/20 via-brand-400/20 to-brand-300/20 p-8 text-white">
          <h2 className="text-2xl font-semibold">Enterprise-grade features out of the box</h2>
          <ul className="mt-6 grid gap-3 text-sm text-slate-100 md:grid-cols-2">
            <li>• Role-based approvals with stakeholder sign-off</li>
            <li>• Asset library with rights management and CDN links</li>
            <li>• AI tone control, hashtag research, and first comment automation</li>
            <li>• Click-through analytics, UTM tagging, and benchmark reporting</li>
            <li>• Native n8n & webhook integrations for automations</li>
            <li>• OpenTelemetry instrumentation and audit trails</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
