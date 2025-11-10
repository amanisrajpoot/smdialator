import { NextRequest } from "next/server";
import { z } from "zod";
import { AssetType } from "@prisma/client";
import { prisma, recordAudit } from "@scheduler/api";
import type { Prisma } from "@prisma/client";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

const assetInputSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  type: z.nativeEnum(AssetType),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const assets = await prisma.asset.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return success(assets);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["asset:manage"]);

    const body = await req.json();
    const payload = assetInputSchema.parse(body);

    const asset = await prisma.asset.create({
      data: {
        workspaceId: params.workspaceId,
        ownerId: user.id,
        type: payload.type,
        url: payload.url,
        thumbnailUrl: payload.thumbnailUrl,
        tags: payload.tags ?? [],
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "asset.created",
      entity: "asset",
      entityId: asset.id,
    });

    return success(asset, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
