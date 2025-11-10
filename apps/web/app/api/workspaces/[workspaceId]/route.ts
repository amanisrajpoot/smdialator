import { NextRequest } from "next/server";
import { prisma } from "@scheduler/api";
import { requireUser, requireWorkspaceContext } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { workspace } = await requireWorkspaceContext(user.id, params.workspaceId);

    const workspaceWithRelations = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      include: {
        profiles: true,
        campaigns: true,
      },
    });

    if (!workspaceWithRelations) {
      return success(null, { status: 404 });
    }

    return success({
      workspace: workspaceWithRelations,
    });
  } catch (error) {
    return handleError(error);
  }
}
