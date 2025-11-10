import { NextRequest } from "next/server";
import { inviteMemberSchema } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, recordAudit, hashPassword } from "@scheduler/api";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["workspace:manage"]);

    const body = await req.json();
    const payload = inviteMemberSchema.parse(body);

    let invitedUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email: payload.email,
          role: payload.role,
          passwordHash: await hashPassword(randomUUID()),
        },
      });
    }

    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: invitedUser.id,
          workspaceId: params.workspaceId,
        },
      },
      create: {
        userId: invitedUser.id,
        workspaceId: params.workspaceId,
        role: payload.role,
      },
      update: {
        role: payload.role,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "workspace.member_invited",
      entity: "workspace",
      entityId: params.workspaceId,
      payload: {
        invitedUserId: invitedUser.id,
        role: payload.role,
      },
    });

    return success(
      {
        userId: invitedUser.id,
        role: payload.role,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
