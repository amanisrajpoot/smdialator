import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { httpErrors } from "../lib/errors";

export function loadWorkspaceContext(paramName = "workspaceId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = (req.params as Record<string, string | undefined>)[paramName] ?? req.query[paramName];
    if (!workspaceId || typeof workspaceId !== "string") {
      return next(httpErrors.badRequest("Workspace identifier missing"));
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user!.id,
          workspaceId,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      return next(httpErrors.forbidden("You are not a member of this workspace"));
    }

    req.workspace = membership.workspace;
    res.locals.role = membership.role;
    next();
  };
}
