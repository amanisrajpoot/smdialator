import { NextRequest } from "next/server";
import { contentUpsertSchema, paginationSchema, ContentStatus, toPaginationParams, buildPaginatedResult } from "@scheduler/common";
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

    const queryObject = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = paginationSchema.parse(queryObject);
    const pagination = {
      page: query.page,
      pageSize: query.pageSize,
    };

    const { take, skip } = toPaginationParams(pagination);

    const [total, items] = await Promise.all([
      prisma.contentItem.count({
        where: { workspaceId: params.workspaceId },
      }),
      prisma.contentItem.findMany({
        where: { workspaceId: params.workspaceId },
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

    return success(buildPaginatedResult(items, total, pagination));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["content:create"]);

    const body = await req.json();
    const payload = contentUpsertSchema.parse(body);

    const item = await prisma.contentItem.create({
      data: {
        workspaceId: params.workspaceId,
        campaignId: payload.campaignId,
        title: payload.title,
        summary: payload.summary,
        status: payload.status ?? ContentStatus.DRAFT,
        targetPlatforms: payload.targetPlatforms as PrismaSocialPlatform[],
        aiContext: (payload.aiContext ?? {}) as Prisma.InputJsonValue,
        createdById: user.id,
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
        versions: true,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "content.created",
      entity: "content_item",
      entityId: item.id,
      payload: {
        title: item.title,
        status: item.status,
      },
    });

    return success(item, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
