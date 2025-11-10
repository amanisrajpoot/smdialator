import type { RequestHandler } from "express";
import morgan from "morgan";
import { logger } from "../config/logger";

export function createHttpLoggingMiddleware(): RequestHandler {
  const stream = {
    write: (message: string) => {
      logger.info(message.trim());
    },
  };
  return morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
      stream,
    }
  );
}
