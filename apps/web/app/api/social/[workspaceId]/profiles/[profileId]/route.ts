import { NextRequest } from "next/server";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, httpErrors, recordAudit } from "@scheduler/api";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { workspaceId: string; profileId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["connector:manage"]);

    const deleted = await prisma.socialProfile.deleteMany({
      where: {
        id: params.profileId,
        workspaceId: params.workspaceId,
      },
    });

    if (deleted.count === 0) {
      throw httpErrors.notFound("Profile not found");
    }

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "social_profile.disconnected",
      entity: "social_profile",
      entityId: params.profileId,
    });

    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
