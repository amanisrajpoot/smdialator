import { NextRequest } from "next/server";
import { socialProfileSchema, SocialPlatform } from "@scheduler/common";
import { getConnector } from "@scheduler/connectors";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, recordAudit } from "@scheduler/api";
import type { Prisma } from "@prisma/client";
import { SocialPlatform as PrismaSocialPlatform } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const profiles = await prisma.socialProfile.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return success(profiles);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["connector:manage"]);

    const body = await req.json();
    const payload = socialProfileSchema.parse(body);

    const connector = getConnector(payload.platform as SocialPlatform);
    const isValid = await connector.validateCredentials({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? undefined,
    });

    if (!isValid) {
      throw new Error("Failed to validate credentials with upstream API");
    }

    const profile = await prisma.socialProfile.create({
      data: {
        workspaceId: params.workspaceId,
        platform: payload.platform as PrismaSocialPlatform,
        displayName: payload.displayName,
        handle: payload.handle,
        externalId: payload.externalId,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "social_profile.connected",
      entity: "social_profile",
      entityId: profile.id,
      payload: {
        platform: profile.platform,
        displayName: profile.displayName,
      },
    });

    return success(profile, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
