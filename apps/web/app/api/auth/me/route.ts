import { NextRequest } from "next/server";
import { prisma } from "@scheduler/api";
import { requireUser } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireUser(req);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: true },
    });

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      memberships: memberships.map((membership) => ({
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
        },
        role: membership.role,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
