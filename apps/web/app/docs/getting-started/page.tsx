export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-14 text-slate-900 dark:text-slate-100">
      <h1 className="text-3xl font-semibold">Getting Started with Omni Social Scheduler APIs</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The Omni API follows a modular design with resources for workspaces, social profiles, content, schedules, analytics,
        assets, and automation workflows. Authenticate with a JWT access token and refresh token pair obtained via
        <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">POST /api/auth/login</code>.
      </p>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Key Endpoints</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Workspaces:</strong> <code>/api/workspaces</code> to list, <code>/api/workspaces/:id/invite</code> to
            add members.
          </li>
          <li>
            <strong>Social Profiles:</strong> <code>/api/social/:workspaceId/profiles</code> to connect Facebook, Instagram,
            LinkedIn, TikTok, Pinterest, YouTube, Google Business, Threads, Reddit, Snapchat, or custom webhooks.
          </li>
          <li>
            <strong>Content:</strong> <code>/api/content/:workspaceId/items</code> to create drafts, manage versions, and
            update approval status.
          </li>
          <li>
            <strong>Scheduling:</strong> <code>/api/scheduler/:workspaceId/schedules</code> to queue posts and manage
            BullMQ jobs.
          </li>
          <li>
            <strong>AI:</strong> <code>/api/ai/generate</code> to request copy variations from OpenAI or Anthropic.
          </li>
          <li>
            <strong>Automation:</strong> <code>/api/automations/:workspaceId/automations</code> to sync with n8n workflows.
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Local Development</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Install pnpm or npm and run install in the repo root.</li>
          <li>Copy <code>.env.example</code> to <code>.env</code> with database, Redis, and API keys.</li>
          <li>Run <code>pnpm db:push && pnpm db:seed</code> to initialize Prisma schema.</li>
          <li>
            Start backend and frontend in parallel:
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">pnpm --filter @scheduler/api dev</code>
            and
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">pnpm --filter @scheduler/web dev</code>.
          </li>
          <li>
            Configure n8n webhooks pointing to <code>http://localhost:4000/webhooks/n8n</code> for automation callbacks.
          </li>
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Security & Observability</h2>
        <ul className="space-y-2 text-sm">
          <li>JWT access tokens last 15 minutes. Refresh tokens stored in Postgres with rotation.</li>
          <li>Social OAuth tokens encrypted with Prisma middleware (configure KMS in production).</li>
          <li>Audit events emitted for content changes, scheduling, automation triggers.</li>
          <li>Instrument express with OpenTelemetry (add OTLP exporter to <code>server.ts</code>).</li>
        </ul>
      </section>
    </div>
  );
}
