import { Router } from "express";
import { contentUpsertSchema, paginationSchema, ContentStatus } from "@scheduler/common";
import { prisma } from "../../config/prisma";
import { SocialPlatform as PrismaSocialPlatform } from "@prisma/client";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { httpErrors } from "../../lib/errors";
import { toPaginationParams, buildPaginatedResult } from "@scheduler/common";
import { recordAudit } from "../../services/audit.service";

export const contentRouter = Router();

contentRouter.use("/:workspaceId/items", authenticate, loadWorkspaceContext("workspaceId"));

contentRouter.get("/:workspaceId/items", async (req, res, next) => {
  try {
    const query = paginationSchema.parse(req.query);
    const pagination = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const { take, skip } = toPaginationParams(pagination);

    const [total, items] = await Promise.all([
      prisma.contentItem.count({
        where: { workspaceId: req.workspace!.id },
      }),
      prisma.contentItem.findMany({
        where: { workspaceId: req.workspace!.id },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          campaign: true,
        },
        orderBy: { updatedAt: "desc" },
        take,
        skip,
      }),
    ]);

    res.json({
      success: true,
      data: buildPaginatedResult(items, total, pagination),
    });
  } catch (error) {
    next(error);
  }
});

contentRouter.post(
  "/:workspaceId/items",
  requirePermissions("content:create"),
  async (req, res, next) => {
    try {
      const payload = contentUpsertSchema.parse(req.body);

      const item = await prisma.contentItem.create({
        data: {
          workspaceId: req.workspace!.id,
          campaignId: payload.campaignId,
          title: payload.title,
          summary: payload.summary,
          status: payload.status ?? ContentStatus.DRAFT,
          targetPlatforms: payload.targetPlatforms as PrismaSocialPlatform[],
          aiContext: payload.aiContext ?? {},
          createdById: req.user!.id,
          versions: {
            create: {
              authorId: req.user!.id,
              body: payload.body,
              assets: payload.assets ?? [],
              prompts: payload.aiContext ?? {},
            },
          },
        },
        include: {
          versions: true,
        },
      });

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "content.created",
        entity: "content_item",
        entityId: item.id,
        payload: {
          title: item.title,
          status: item.status,
        },
      });

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
);

contentRouter.put(
  "/:workspaceId/items/:contentId",
  requirePermissions("content:create"),
  async (req, res, next) => {
    try {
      const payload = contentUpsertSchema.parse(req.body);
      const contentId = req.params.contentId;

      const item = await prisma.contentItem.findFirst({
        where: {
          id: contentId,
          workspaceId: req.workspace!.id,
        },
        include: { versions: true },
      });

      if (!item) {
        throw httpErrors.notFound("Content item not found");
      }

      const updated = await prisma.contentItem.update({
        where: { id: item.id },
        data: {
          title: payload.title,
          summary: payload.summary,
          status: payload.status ?? item.status,
          campaignId: payload.campaignId,
          targetPlatforms: payload.targetPlatforms as PrismaSocialPlatform[],
          updatedById: req.user!.id,
          aiContext: payload.aiContext ?? item.aiContext,
          versions: {
            create: {
              authorId: req.user!.id,
              body: payload.body,
              assets: payload.assets ?? [],
              prompts: payload.aiContext ?? {},
            },
          },
        },
        include: {
          versions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "content.updated",
        entity: "content_item",
        entityId: updated.id,
        payload: {
          status: updated.status,
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

contentRouter.post(
  "/:workspaceId/items/:contentId/status",
  requirePermissions("content:review"),
  async (req, res, next) => {
    try {
      const contentId = req.params.contentId;
      const status = req.body.status as ContentStatus | undefined;

      if (!status) {
        throw httpErrors.badRequest("status is required");
      }

      const updated = await prisma.contentItem.updateMany({
        where: {
          id: contentId,
          workspaceId: req.workspace!.id,
        },
        data: {
          status,
        },
      });

      if (updated.count === 0) {
        throw httpErrors.notFound("Content item not found");
      }

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "content.status_changed",
        entity: "content_item",
        entityId: contentId,
        payload: {
          status,
        },
      });

      res.json({
        success: true,
        data: {
          id: contentId,
          status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
