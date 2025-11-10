import { NextRequest } from "next/server";
import { getConnector } from "@scheduler/connectors";
import { SocialPlatform } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, httpErrors } from "@scheduler/api";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string; profileId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["connector:manage"]);

    const profile = await prisma.socialProfile.findFirst({
      where: {
        id: params.profileId,
        workspaceId: params.workspaceId,
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
        metadata: (refreshed.metadata ?? profile.metadata) as Prisma.InputJsonValue,
      },
    });

    return success(updated);
  } catch (error) {
    return handleError(error);
  }
}
