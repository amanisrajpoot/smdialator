import { NextRequest } from "next/server";
import { prisma, verifyAccessToken, httpErrors } from "@scheduler/api";
import type { User, Workspace, WorkspaceMember, $Enums } from "@prisma/client";
import { hasPermission, type Permission, UserRole } from "@scheduler/common";

export interface AuthContext {
  user: User;
}

export interface WorkspaceContext {
  workspace: Workspace;
  membership: WorkspaceMember & { workspace: Workspace };
}

export async function requireUser(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw httpErrors.unauthorized("Missing access token");
  }

  const token = authHeader.substring("Bearer ".length);

  let payload: { sub: string };
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    throw httpErrors.unauthorized("Invalid or expired access token", error);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw httpErrors.unauthorized("User not found");
  }

  return { user };
}

export async function requireWorkspaceContext(userId: string, workspaceId: string): Promise<WorkspaceContext> {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!membership) {
    throw httpErrors.forbidden("You are not a member of this workspace");
  }

  return {
    workspace: membership.workspace,
    membership,
  };
}

type PrismaUserRole = $Enums.UserRole;

export function ensurePermissions(role: UserRole | PrismaUserRole, permissions: Permission[]) {
  const normalizedRole = role as UserRole;
  const allowed = permissions.every((permission) => hasPermission(normalizedRole, permission));
  if (!allowed) {
    throw httpErrors.forbidden("Insufficient permissions");
  }
}
