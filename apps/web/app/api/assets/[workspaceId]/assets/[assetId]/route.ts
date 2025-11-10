import { NextRequest } from "next/server";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, httpErrors, recordAudit } from "@scheduler/api";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { workspaceId: string; assetId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["asset:manage"]);

    const deleted = await prisma.asset.deleteMany({
      where: {
        id: params.assetId,
        workspaceId: params.workspaceId,
      },
    });

    if (deleted.count === 0) {
      throw httpErrors.notFound("Asset not found");
    }

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "asset.deleted",
      entity: "asset",
      entityId: params.assetId,
    });

    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
