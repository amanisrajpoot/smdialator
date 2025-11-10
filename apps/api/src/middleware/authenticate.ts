import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { httpErrors } from "../lib/errors";
import { verifyAccessToken } from "../services/token.service";
import { getRequestContext } from "./request-context";
import { hasPermission, type Permission, UserRole } from "@scheduler/common";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(httpErrors.unauthorized("Missing access token"));
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return next(httpErrors.unauthorized("User not found"));
    }

    req.user = user;
    const context = getRequestContext(res);
    context.userId = user.id;

    if (payload.workspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: payload.workspaceId,
          },
        },
        include: {
          workspace: true,
        },
      });

      if (!membership) {
        return next(httpErrors.forbidden("Workspace access denied"));
      }

      req.workspace = membership.workspace;
      context.workspaceId = membership.workspaceId;
      context.userId = user.id;
      res.locals.role = membership.role;
    } else {
      res.locals.role = user.role ?? UserRole.EDITOR;
    }

    return next();
  } catch (error) {
    return next(httpErrors.unauthorized("Invalid or expired access token", error));
  }
}

export function requireWorkspaceAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.workspace) {
    return next(httpErrors.badRequest("Workspace context required"));
  }
  return next();
}

export function requirePermissions(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = res.locals.role as UserRole | undefined;
    if (!role) {
      return next(httpErrors.forbidden("Role missing from context"));
    }

    const allowed = permissions.every((permission) => hasPermission(role, permission));
    if (!allowed) {
      return next(httpErrors.forbidden("Insufficient permissions"));
    }

    next();
  };
}
