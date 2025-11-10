import { Router } from "express";
import { listConnectors, getConnector } from "@connectors";
import { SocialPlatform } from "@scheduler/common";
import { socialProfileSchema } from "@scheduler/common";
import { SocialPlatform as PrismaSocialPlatform } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { httpErrors } from "../../lib/errors";
import { recordAudit } from "../../services/audit.service";

export const socialRouter = Router();

socialRouter.get("/connectors", authenticate, (_req, res) => {
  res.json({
    success: true,
    data: listConnectors(),
  });
});

socialRouter.use("/:workspaceId/profiles", authenticate, loadWorkspaceContext("workspaceId"));

socialRouter.get("/:workspaceId/profiles", async (req, res, next) => {
  try {
    const profiles = await prisma.socialProfile.findMany({
      where: { workspaceId: req.workspace!.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
});

socialRouter.post(
  "/:workspaceId/profiles",
  requirePermissions("connector:manage"),
  async (req, res, next) => {
    try {
      const payload = socialProfileSchema.parse(req.body);
      const connector = getConnector(payload.platform as SocialPlatform);

      const isValid = await connector.validateCredentials({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? undefined,
      });

      if (!isValid) {
        throw httpErrors.badRequest("Failed to validate credentials with upstream API");
      }

      const profile = await prisma.socialProfile.create({
        data: {
          workspaceId: req.workspace!.id,
          platform: payload.platform as PrismaSocialPlatform,
          displayName: payload.displayName,
          handle: payload.handle,
          externalId: payload.externalId,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          metadata: payload.metadata ?? {},
        },
      });

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "social_profile.connected",
        entity: "social_profile",
        entityId: profile.id,
        payload: {
          platform: profile.platform,
          displayName: profile.displayName,
        },
      });

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

socialRouter.post(
  "/:workspaceId/profiles/:profileId/refresh",
  requirePermissions("connector:manage"),
  async (req, res, next) => {
    try {
      const profile = await prisma.socialProfile.findFirst({
        where: {
          id: req.params.profileId,
          workspaceId: req.workspace!.id,
        },
      });

      if (!profile) {
        throw httpErrors.notFound("Profile not found");
      }

      const connector = getConnector(profile.platform as unknown as SocialPlatform);

      if (!connector.refreshCredentials) {
        throw httpErrors.badRequest("Connector does not support token refresh");
      }

      const refreshed = await connector.refreshCredentials({
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken ?? undefined,
        expiresAt: profile.tokenExpiresAt ?? undefined,
        metadata: profile.metadata as Record<string, unknown>,
      });

      const updated = await prisma.socialProfile.update({
        where: { id: profile.id },
        data: {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? profile.refreshToken,
          tokenExpiresAt: refreshed.expiresAt ?? profile.tokenExpiresAt,
          metadata: refreshed.metadata ?? profile.metadata,
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

socialRouter.delete(
  "/:workspaceId/profiles/:profileId",
  requirePermissions("connector:manage"),
  async (req, res, next) => {
    try {
      const deleted = await prisma.socialProfile.deleteMany({
        where: {
          id: req.params.profileId,
          workspaceId: req.workspace!.id,
        },
      });

      if (deleted.count === 0) {
        throw httpErrors.notFound("Profile not found");
      }

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "social_profile.disconnected",
        entity: "social_profile",
        entityId: req.params.profileId,
      });

      res.json({
        success: true,
        data: {
          deleted: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
