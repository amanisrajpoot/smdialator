import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface RequestContext {
  requestId: string;
  startedAt: number;
  userId?: string;
  workspaceId?: string;
}

declare module "express-serve-static-core" {
  interface Response {
    locals: {
      context?: RequestContext;
      [key: string]: unknown;
    };
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

  const context: RequestContext = {
    requestId,
    startedAt: Date.now(),
  };

  res.locals.context = context;
  res.setHeader("x-request-id", requestId);

  next();
}

export function getRequestContext(res: Response): RequestContext {
  if (!res.locals.context) {
    throw new Error("Request context is not initialized");
  }
  return res.locals.context;
}
