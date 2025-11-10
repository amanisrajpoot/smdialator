import { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (error) => {
  logger.error(error, "Redis connection error");
});

redis.on("ready", () => {
  logger.info("Redis connection established");
});
