import { NextRequest } from "next/server";
import { z } from "zod";
import { ContentStatus } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, recordAudit, httpErrors } from "@scheduler/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string; contentId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["content:review"]);

    const body = await req.json();
    const { status } = z.object({ status: z.nativeEnum(ContentStatus) }).parse(body);

    const updated = await prisma.contentItem.updateMany({
      where: {
        id: params.contentId,
        workspaceId: params.workspaceId,
      },
      data: {
          status,
      },
    });

    if (updated.count === 0) {
      throw httpErrors.notFound("Content item not found");
    }

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "content.status_changed",
      entity: "content_item",
      entityId: params.contentId,
      payload: {
        status,
      },
    });

    return success({
      id: params.contentId,
      status,
    });
  } catch (error) {
    return handleError(error);
  }
}
