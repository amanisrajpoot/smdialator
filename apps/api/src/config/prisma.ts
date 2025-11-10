import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "./logger";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

prisma.$on("beforeExit", async () => {
  logger.info("Prisma client disconnecting");
});
