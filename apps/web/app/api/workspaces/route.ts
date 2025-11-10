import { NextRequest } from "next/server";
import { prisma } from "@scheduler/api";
import { createWorkspaceSchema } from "@scheduler/common";
import { requireUser } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireUser(req);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: true,
      },
    });

    return success(
      memberships.map((membership) => ({
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
          timezone: membership.workspace.timezone,
        },
        role: membership.role,
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser(req);
    const body = await req.json();
    const payload = createWorkspaceSchema.parse(body);

    const workspace = await prisma.workspace.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        timezone: payload.timezone,
        description: payload.description,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return success(workspace, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
