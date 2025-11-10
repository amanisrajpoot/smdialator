import type { Express } from "express";
import { healthRouter } from "../modules/health/health.router";
import { authRouter } from "../modules/auth/auth.router";
import { workspacesRouter } from "../modules/workspaces/workspaces.router";
import { socialRouter } from "../modules/social/social.router";
import { contentRouter } from "../modules/content/content.router";
import { schedulerRouter } from "../modules/scheduler/scheduler.router";
import { aiRouter } from "../modules/ai/ai.router";
import { analyticsRouter } from "../modules/analytics/analytics.router";
import { assetsRouter } from "../modules/assets/assets.router";
import { automationsRouter } from "../modules/automations/automations.router";
import { webhooksRouter } from "../modules/webhooks/webhooks.router";

export function registerRoutes(app: Express) {
  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/workspaces", workspacesRouter);
  app.use("/api/social", socialRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/scheduler", schedulerRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/assets", assetsRouter);
  app.use("/api/automations", automationsRouter);
  app.use("/webhooks", webhooksRouter);
}
