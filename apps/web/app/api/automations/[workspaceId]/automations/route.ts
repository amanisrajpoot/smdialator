import { NextRequest } from "next/server";
import { automationWorkflowSchema } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, recordAudit } from "@scheduler/api";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const workflows = await prisma.automationWorkflow.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return success(workflows);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["automation:manage"]);

    const body = await req.json();
    const payload = automationWorkflowSchema.parse(body);

    const workflow = await prisma.automationWorkflow.create({
      data: {
        workspaceId: params.workspaceId,
        name: payload.name,
        description: payload.description,
        trigger: payload.trigger,
        actions: payload.actions,
        config: (payload.config ?? {}) as Prisma.InputJsonValue,
        isActive: payload.isActive ?? true,
        createdById: user.id,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "automation.created",
      entity: "automation_workflow",
      entityId: workflow.id,
    });

    return success(workflow, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
