import type { NextFunction, Request, Response } from "express";
import { ApiError, isApiError } from "../lib/errors";
import { logger } from "../config/logger";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const statusCode = isApiError(error) ? error.statusCode : 500;

  if (!isApiError(error)) {
    logger.error(
      {
        path: req.path,
        method: req.method,
        error,
      },
      "Unhandled error"
    );
  }

  const payload = {
    success: false,
    error: {
      message: isApiError(error) ? error.message : "Internal Server Error",
      details: isApiError(error) ? error.details : undefined,
    },
  };

  res.status(statusCode).json(payload);
}
