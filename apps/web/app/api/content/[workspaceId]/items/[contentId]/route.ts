import { NextRequest } from "next/server";
import { contentUpsertSchema } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, httpErrors, recordAudit } from "@scheduler/api";
import type { Prisma } from "@prisma/client";
import { SocialPlatform as PrismaSocialPlatform } from "@prisma/client";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { workspaceId: string; contentId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["content:create"]);

    const body = await req.json();
    const payload = contentUpsertSchema.parse(body);

    const item = await prisma.contentItem.findFirst({
      where: {
        id: params.contentId,
        workspaceId: params.workspaceId,
      },
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
        updatedById: user.id,
          aiContext: (payload.aiContext ?? item.aiContext) as Prisma.InputJsonValue,
        versions: {
          create: {
            authorId: user.id,
            body: payload.body,
              assets: (payload.assets ?? []) as Prisma.InputJsonValue,
              prompts: (payload.aiContext ?? {}) as Prisma.InputJsonValue,
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
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "content.updated",
      entity: "content_item",
      entityId: updated.id,
        payload: {
          status: updated.status,
        },
    });

    return success(updated);
  } catch (error) {
    return handleError(error);
  }
}
