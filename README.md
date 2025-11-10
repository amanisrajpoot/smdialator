# Omni Social Scheduler

Omni is a full-stack social media operations suite that helps teams ideate, schedule, publish, automate, and analyse content across every major network. It includes a TypeScript/Express API, Prisma/PostgreSQL data layer, BullMQ background workers, reusable social connectors, AI provider orchestration, n8n workflow integration, and a Next.js 14 dashboard.

## Highlights

- **Multi-network connectors** – Facebook, Instagram, Threads, LinkedIn, X (Twitter), TikTok, Pinterest, YouTube, Google Business, Reddit, Snapchat, and custom webhooks. Each connector shares a common interface for publishing, credentials validation, and insights retrieval.
- **AI co-pilot** – Orchestrates OpenAI and Anthropic models for post ideation, rewriting, and hashtag generation with tone & word count controls.
- **Scheduling engine** – Prisma models for content, approvals, scheduled posts, publishing jobs, and analytics snapshots. BullMQ workers publish to connectors with retry/backoff logic.
- **Automation bridge** – Native n8n client to list workflows, trigger runs, and maintain automation metadata within workspaces.
- **Collaboration tooling** – Workspaces, members, RBAC, content versions, comments (extensible), asset library, audit logs.
- **Dashboard** – Next.js App Router experience with React Query, Tailwind UI, analytics visualisation, connector inventory, and calendar overview.

## Repository Layout

```
apps/
  api/           # Express + Prisma backend
  web/           # Next.js 14 dashboard
packages/
  common/        # Shared enums, schemas, permissions, pagination helpers
  connectors/    # Pluggable social media connectors
  ai/            # AI provider orchestrator (OpenAI, Anthropic)
  n8n/           # n8n REST API client
docs/
  architecture.md
prisma/
  schema.prisma
  seed.ts
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 6+ (for BullMQ)
- pnpm (recommended) or npm
- Optional: n8n instance, S3-compatible storage (MinIO), OpenAI / Anthropic API keys

## Quickstart

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env

# Prepare database
pnpm db:push
pnpm db:seed

# Start backend (port 4000)
pnpm --filter @scheduler/api dev

# Start frontend (port 3000)
pnpm --filter @scheduler/web dev
```

Open http://localhost:3000 to access the dashboard. The seed script creates a sample workspace (`demo-brand`) with demo content and connectors.

### API Authentication

1. `POST /api/auth/login` using the seeded user (`founder@example.com` / `Password123!`) to receive access & refresh tokens.
2. Include the `Authorization: Bearer <token>` header for subsequent workspace-scoped endpoints.
3. Refresh tokens via `POST /api/auth/refresh`.

### Primary REST Resources

- **Workspaces** – `GET /api/workspaces`, `POST /api/workspaces`, `POST /api/workspaces/:id/invite`
- **Social Profiles** – `GET/POST /api/social/:workspaceId/profiles`
- **Content Library** – `GET/POST/PUT /api/content/:workspaceId/items`
- **Schedules** – `GET/POST/PATCH /api/scheduler/:workspaceId/schedules`
- **Assets** – `GET/POST/DELETE /api/assets/:workspaceId/assets`
- **Analytics** – `GET /api/analytics/:workspaceId/overview`
- **Automations** – `GET/POST /api/automations/:workspaceId/automations`, `POST .../:automationId/trigger`
- **AI** – `POST /api/ai/generate`

### Background Workers

Publishing jobs are enqueued via `BullMQ` into the `publishing` queue. Workers live in `apps/api/src/jobs/workers/publishing.worker.ts`, loading pending posts, resolving connector credentials, and updating statuses.

Start a dedicated worker process if you split responsibilities:

```bash
pnpm --filter @scheduler/api dev # API (includes worker bootstrap)
```

### Connectors Package

The `@scheduler/connectors` package normalises publishing to each social platform. For production use:

- Provide real OAuth tokens via the `/api/social` endpoints.
- Extend each connector with media upload logic (e.g., Facebook video containers, YouTube resumable uploads).
- Implement webhook handlers in `modules/webhooks` to react to comment, error, or analytics events.

### AI Orchestrator

Configure at least one provider in `.env` (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`). The orchestrator will fall back gracefully and can be extended to include Vertex AI or custom LLMs.

### Automation (n8n)

Populate `N8N_BASE_URL` and `N8N_API_KEY` to enable:

- Listing workflows from n8n (`GET /api/automations/:workspaceId/automations/n8n/workflows`)
- Triggering workflows manually
- Storing automation metadata alongside workspaces

### Observability & Security Notes

- JWT secrets and OAuth tokens should be managed with a secrets manager in production.
- Add OpenTelemetry instrumentation in `server.ts` for distributed tracing.
- Configure Prisma middleware to encrypt sensitive columns (currently plain for brevity).
- Consider multi-region data residency by sharding workspaces across DB schemas.

## Frontend Overview

The dashboard uses Next.js App Router with React Query, Tailwind, and Recharts:

- `/` – Marketing overview
- `/dashboard` – Calendar, connector health, analytics summary
- `/docs/getting-started` – API usage guide

Extend with authenticated layouts, workspace selectors, approval flows, and asset management pages as needed.

## Future Enhancements

- Real-time updates via WebSockets / SSE for job status
- Machine learning powered best-time recommendations
- Paid ads campaign management (Meta Ads, LinkedIn Campaign Manager)
- Comment inbox and social listening integrations
- Native mobile apps leveraging the same API

---

Built with ❤️ as a foundation for a production-grade social media scheduler. Customize connectors, UI, and automations to match your organisation's needs.
