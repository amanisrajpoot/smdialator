import { Router } from "express";
import { AssetType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { httpErrors } from "../../lib/errors";
import { recordAudit } from "../../services/audit.service";

const assetInputSchema = {
  parse(body: unknown) {
    if (!body || typeof body !== "object") {
      throw httpErrors.badRequest("Invalid payload");
    }
    const payload = body as Record<string, unknown>;
    if (typeof payload.url !== "string") {
      throw httpErrors.badRequest("url is required");
    }
    if (typeof payload.type !== "string" || !(payload.type in AssetType)) {
      throw httpErrors.badRequest("type is required");
    }
    return {
      url: payload.url,
      thumbnailUrl: typeof payload.thumbnailUrl === "string" ? payload.thumbnailUrl : undefined,
      type: payload.type as AssetType,
      tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : [],
      metadata: typeof payload.metadata === "object" ? (payload.metadata as Record<string, unknown>) : {},
    };
  },
};

export const assetsRouter = Router();

assetsRouter.use("/:workspaceId/assets", authenticate, loadWorkspaceContext("workspaceId"));

assetsRouter.get("/:workspaceId/assets", async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { workspaceId: req.workspace!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
});

assetsRouter.post(
  "/:workspaceId/assets",
  requirePermissions("asset:manage"),
  async (req, res, next) => {
    try {
      const payload = assetInputSchema.parse(req.body);

      const asset = await prisma.asset.create({
        data: {
          workspaceId: req.workspace!.id,
          ownerId: req.user!.id,
          type: payload.type,
          url: payload.url,
          thumbnailUrl: payload.thumbnailUrl,
          tags: payload.tags,
          metadata: payload.metadata,
        },
      });

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "asset.created",
        entity: "asset",
        entityId: asset.id,
      });

      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }
);

assetsRouter.delete(
  "/:workspaceId/assets/:assetId",
  requirePermissions("asset:manage"),
  async (req, res, next) => {
    try {
      const deleted = await prisma.asset.deleteMany({
        where: {
          id: req.params.assetId,
          workspaceId: req.workspace!.id,
        },
      });

      if (deleted.count === 0) {
        throw httpErrors.notFound("Asset not found");
      }

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "asset.deleted",
        entity: "asset",
        entityId: req.params.assetId,
      });

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
);
