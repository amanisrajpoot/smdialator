import type { Request, Response } from "express";
import { httpErrors } from "../lib/errors";

export function notFoundHandler(req: Request, res: Response) {
  const error = httpErrors.notFound(`Route ${req.method} ${req.originalUrl} not found`);
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
    },
  });
}
