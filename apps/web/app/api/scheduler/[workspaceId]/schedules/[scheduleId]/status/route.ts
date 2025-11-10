import { NextRequest } from "next/server";
import { updateScheduleStatusSchema } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, recordAudit, httpErrors } from "@scheduler/api";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { workspaceId: string; scheduleId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["schedule:manage"]);

    const body = await req.json();
    const payload = updateScheduleStatusSchema.parse(body);

    const updated = await prisma.scheduledPost.updateMany({
      where: {
        id: params.scheduleId,
        workspaceId: params.workspaceId,
      },
      data: {
        status: payload.status,
        failureReason: payload.failureReason,
      },
    });

    if (updated.count === 0) {
      throw httpErrors.notFound("Scheduled post not found");
    }

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "schedule.status_changed",
      entity: "scheduled_post",
      entityId: params.scheduleId,
      payload,
    });

    return success({
      id: params.scheduleId,
      status: payload.status,
    });
  } catch (error) {
    return handleError(error);
  }
}
