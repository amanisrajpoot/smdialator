import { NextRequest } from "next/server";
import { registerSchema } from "@scheduler/common";
import { prisma, hashPassword, createAccessToken, createRefreshToken, httpErrors } from "@scheduler/api";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw httpErrors.conflict("Email is already registered");
    }

    const passwordHash = await hashPassword(payload.password);
    const workspaceSlug = payload.workspaceSlug.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: payload.workspaceName,
          slug: workspaceSlug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      return { user, workspace };
    });

    const accessToken = await createAccessToken(result.user.id, result.workspace.id, "OWNER");
    const refreshToken = await createRefreshToken(result.user.id);

    return success(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
