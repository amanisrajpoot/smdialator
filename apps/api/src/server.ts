import http from "node:http";
import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { initQueues } from "./jobs/queues";

export async function createServer() {
  await initQueues();

  const httpServer = http.createServer(app);

  httpServer.on("error", (error) => {
    logger.error(error, "HTTP server error");
  });

  const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.info({ signal }, "Received shutdown signal");
      httpServer.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });
  });

  return httpServer;
}
