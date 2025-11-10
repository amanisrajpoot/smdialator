import { NextRequest } from "next/server";
import { loginSchema } from "@scheduler/common";
import { prisma, comparePassword, createAccessToken, createRefreshToken, httpErrors } from "@scheduler/api";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw httpErrors.unauthorized("Invalid credentials");
    }

    const matches = await comparePassword(payload.password, user.passwordHash);
    if (!matches) {
      throw httpErrors.unauthorized("Invalid credentials");
    }

    const primaryMembership = user.workspaces[0];
    const workspace = primaryMembership?.workspace ?? null;
    const role = primaryMembership?.role ?? user.role ?? "EDITOR";

    const accessToken = await createAccessToken(user.id, workspace?.id, role);
    const refreshToken = await createRefreshToken(user.id);

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
          }
        : null,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
