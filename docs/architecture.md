# Omni Social Scheduler – Architecture Overview

## Vision

Build a versatile, enterprise-ready social media scheduling and automation platform that centralizes content planning, creative assistance, cross-channel publishing, analytics, and workflow orchestration. The system must connect with all major social networks, AI content providers, and automation platforms such as n8n, offering teams a single pane of glass to ideate, coordinate, approve, schedule, and measure campaigns.

## High-Level System Diagram

```
       ┌──────────────────────┐
       │  Web Dashboard (Next)│
       └──────────┬───────────┘
                  │ GraphQL/REST/gRPC
                  ▼
        ┌─────────────────────────────┐
        │        API Gateway          │
        │ (Express + Zod + tRPC layer)│
        └───────┬───────────┬────────┘
                │           │
                │           │
                ▼           ▼
    ┌─────────────────┐   ┌─────────────────┐
    │ Command Service │   │ Query Service   │
    │ (Scheduling)    │   │ (Analytics)     │
    └──────┬──────────┘   └──────┬──────────┘
           │                     │
           ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐
    │ BullMQ Workers  │   │ Data Warehouse  │
    │ (Redis)         │   │ (PostgreSQL +   │
    └──────┬──────────┘   │  ClickHouse)    │
           │              └─────────────────┘
           ▼
 ┌────────────────────┐
 │ Connector Runtime  │──────────────┐
 │ (Node workers)     │              │
 └────────────────────┘              │
          │                          │
          ▼                          ▼
 ┌──────────────┐           ┌───────────────────┐
 │ Social APIs  │ ...       │ AI / n8n / Webhooks│
 └──────────────┘           └───────────────────┘
```

## Key Workspaces

- `apps/api`: Express-based API layer that exposes REST + tRPC endpoints, handles auth, scheduling orchestration, account management, and webhooks.
- `apps/web`: Next.js dashboard providing calendar, asset library, approvals, analytics, and integration management UIs.
- `packages/connectors`: Collection of pluggable connector SDKs implementing normalized interfaces for each social network. Each connector handles auth, channel metadata, publishing, and webhook handling.
- `packages/ai`: Abstractions for AI content generation (OpenAI, Anthropic, Vertex AI), tone control, rewriting, and hashtag research.
- `packages/n8n`: Client and helper utilities to register, manage, and trigger n8n workflows; provides bidirectional sync between scheduled jobs and workflow automations.
- `packages/common`: Shared domain models, DTOs, input validators, and event definitions.

## Core Domain Concepts

- **Workspace**: Tenant-scoped container for teams, social accounts, assets, workflows, analytics dashboards.
- **User & Roles**: RBAC with granular permissions (owner, manager, editor, viewer, stakeholder/external approver).
- **SocialProfile**: Represents an authenticated channel (Facebook Page, LinkedIn Company Page, TikTok profile, Pinterest board, etc.).
- **ContentItem**: Draft or reusable asset (text, images, video, link).
- **Campaign**: Grouping of ContentItems with shared objectives, budgets, or timelines.
- **ScheduledPost**: A publish instruction tied to a SocialProfile, with timing, content variant, and targeting metadata.
- **PublishingJob**: Background job responsible for rendering, attaching media, respecting channel constraints, and posting via the connector.
- **ApprovalFlow**: Multi-step state machine for drafts requiring review. Integrates with email, Slack, and n8n tasks.
- **InsightsSnapshot**: Cached metrics for a SocialProfile or post (reach, engagement, CTR, follower growth).
- **AutomationWorkflow**: Integration with third-party systems (n8n, Zapier, Make.com) to trigger posts or respond to events.

## Feature Pillars

1. **Unified Scheduling** – Drag-and-drop calendar, bulk uploads, time zone awareness, best-time suggestions.
2. **AI-Assisted Creation** – Prompt-to-post generation, variant suggestions, rewriting, image generation, hashtag/keyword suggestions.
3. **Multi-Network Publishing** – Adapters for Facebook, Instagram, Threads, LinkedIn, X (Twitter), TikTok, Pinterest, YouTube, Snapchat, Reddit.
4. **Approvals & Collaboration** – Commenting, version history, reviewer assignments, status tracking.
5. **Asset Library** – Centralized media storage with tagging, rights management, CDN integration.
6. **Analytics & Reporting** – Unified KPIs, custom dashboards, scheduled exports, baseline comparisons.
7. **Automation Integrations** – Native support for n8n, webhooks, custom scripts, RSS feeds.
8. **Compliance & Governance** – Audit logs, regional data residency, SSO/SAML, secrets storage.

## Technology Choices

- **Backend**: Node.js (TypeScript), Express router + tRPC, Prisma ORM with PostgreSQL primary DB, BullMQ for job orchestration (Redis), Zod for validation, JWT + OAuth for auth.
- **Frontend**: Next.js App Router, React Server Components, TanStack Query, Tailwind CSS, Zustand for local state, FullCalendar for schedule view, Recharts for analytics.
- **Messaging/Jobs**: Redis (BullMQ), optional Kafka for high-throughput event stream.
- **Storage**: PostgreSQL for relational data, S3-compatible object storage for media, ClickHouse (optional) for rich analytics.
- **Observability**: OpenTelemetry instrumentation, Log aggregation via Pino + Loki/ELK, metrics with Prometheus + Grafana.

## Module Interaction

1. **Scheduling Flow**
   - User creates a draft via dashboard.
   - AI suggestions generated asynchronously.
   - Draft approved -> scheduled post created.
   - Job enqueued in BullMQ with timezone adjustments and best-time heuristics.
   - Worker fetches connector credentials, renders post, uploads assets, publishes, records result.

2. **Analytics Flow**
   - Connector fetchers periodically poll APIs for metrics.
   - Data normalized and written to `InsightsSnapshot`.
   - Aggregations cached and surfaced via GraphQL.

3. **Automation Flow**
   - n8n workflow triggered on events (new draft, job failure, publish success).
   - Webhooks from n8n route back to automation module to perform actions (schedule additional posts, notify).

## Security & Compliance

- OAuth flows isolated per connector with secure token storage (encryption at rest + rotation).
- JWT short-lived access tokens with refresh tokens stored in Redis.
- Role-based authorization middleware with per-route guard composition.
- Audit events emitted on sensitive actions, persisted asynchronously.
- Configurable data retention policies and export tooling for GDPR compliance.

## Scaling Considerations

- Stateless API replicas behind load balancer.
- Job workers horizontally scaled; connectors isolate rate-limited calls per account.
- Multi-tenancy via workspace scoping and row-level security.
- Feature flags for gradual rollout of connectors.

## Future Enhancements

- Automatic best-time predictions using machine learning.
- Paid ad campaign management (Meta Ads, LinkedIn Campaign Manager).
- Social listening and sentiment analysis integration.
- Mobile apps with push notifications.
- Native integrations with CRM and DAM systems.
