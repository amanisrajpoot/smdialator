import { NextRequest } from "next/server";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { getN8nClient } from "@scheduler/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["automation:manage"]);

    const workflows = await getN8nClient().listWorkflows();
    return success(workflows);
  } catch (error) {
    return handleError(error);
  }
}
