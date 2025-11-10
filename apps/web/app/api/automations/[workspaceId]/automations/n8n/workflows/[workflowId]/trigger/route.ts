import { NextRequest } from "next/server";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { getN8nClient } from "@scheduler/api";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; workflowId: string } }
) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["automation:manage"]);

    const body = await req.json().catch(() => ({}));
    const payload = body.payload || {};

    await getN8nClient().triggerWorkflow(params.workflowId, {
      workspaceId: params.workspaceId,
      triggeredBy: user.id,
      ...payload,
    });

    return success({
      triggered: true,
      workflowId: params.workflowId,
    });
  } catch (error) {
    return handleError(error);
  }
}
