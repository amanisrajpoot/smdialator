import { Router } from "express";
import { automationWorkflowSchema, AutomationTrigger } from "@scheduler/common";
import { prisma } from "../../config/prisma";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { getN8nClient } from "../../services/n8n.service";
import { httpErrors } from "../../lib/errors";
import { recordAudit } from "../../services/audit.service";

export const automationsRouter = Router();

automationsRouter.use("/:workspaceId/automations", authenticate, loadWorkspaceContext("workspaceId"));

automationsRouter.get("/:workspaceId/automations", async (req, res, next) => {
  try {
    const workflows = await prisma.automationWorkflow.findMany({
      where: { workspaceId: req.workspace!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
});

automationsRouter.post(
  "/:workspaceId/automations",
  requirePermissions("automation:manage"),
  async (req, res, next) => {
    try {
      const payload = automationWorkflowSchema.parse(req.body);

      const workflow = await prisma.automationWorkflow.create({
        data: {
          workspaceId: req.workspace!.id,
          name: payload.name,
          description: payload.description,
          trigger: payload.trigger,
          actions: payload.actions,
          config: payload.config ?? {},
          isActive: payload.isActive ?? true,
          createdById: req.user!.id,
        },
      });

      await recordAudit({
        workspaceId: workflow.workspaceId,
        actorId: req.user!.id,
        action: "automation.created",
        entity: "automation_workflow",
        entityId: workflow.id,
      });

      res.status(201).json({
        success: true,
        data: workflow,
      });
    } catch (error) {
      next(error);
    }
  }
);

automationsRouter.get(
  "/:workspaceId/automations/n8n/workflows",
  requirePermissions("automation:manage"),
  async (_req, res, next) => {
    try {
      const workflows = await getN8nClient().listWorkflows();
      res.json({
        success: true,
        data: workflows,
      });
    } catch (error) {
      next(error);
    }
  }
);

automationsRouter.post(
  "/:workspaceId/automations/:automationId/trigger",
  requirePermissions("automation:manage"),
  async (req, res, next) => {
    try {
      const workflow = await prisma.automationWorkflow.findFirst({
        where: {
          id: req.params.automationId,
          workspaceId: req.workspace!.id,
        },
      });

      if (!workflow) {
        throw httpErrors.notFound("Automation not found");
      }

      if (workflow.trigger !== AutomationTrigger.MANUAL) {
        throw httpErrors.badRequest("Only manual automations can be triggered directly");
      }

      const workflowId = (workflow.config as Record<string, unknown>)?.["workflowId"] as string | undefined;
      if (!workflowId) {
        throw httpErrors.badRequest("Automation is missing n8n workflowId in config");
      }

      await getN8nClient().triggerWorkflow(workflowId, {
        workspaceId: req.workspace!.id,
        triggeredBy: req.user!.id,
      });

      res.json({
        success: true,
        data: {
          triggered: true,
          workflowId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
