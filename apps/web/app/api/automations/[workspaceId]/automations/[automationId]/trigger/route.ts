import { NextRequest } from "next/server";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { AutomationTrigger } from "@scheduler/common";
import { prisma, httpErrors, getN8nClient } from "@scheduler/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string; automationId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["automation:manage"]);

    const workflow = await prisma.automationWorkflow.findFirst({
      where: {
        id: params.automationId,
        workspaceId: params.workspaceId,
      },
    });

    if (!workflow) {
      throw httpErrors.notFound("Automation not found");
    }

    if (workflow.trigger !== AutomationTrigger.MANUAL) {
      throw httpErrors.badRequest("Only manual automations can be triggered directly");
    }

    const workflowId = (workflow.config as Record<string, unknown>)?.["workflowId"] as string | undefined;
    if (!workflowId) {
      throw httpErrors.badRequest("Automation is missing n8n workflowId in config");
    }

    await getN8nClient().triggerWorkflow(workflowId, {
      workspaceId: params.workspaceId,
      triggeredBy: user.id,
    });

    return success({
      triggered: true,
      workflowId,
    });
  } catch (error) {
    return handleError(error);
  }
}
