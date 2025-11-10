import { Router } from "express";
import { prisma } from "../../config/prisma";
import { redis } from "../../config/redis";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const dbPromise = prisma.$queryRaw`SELECT 1`;
  const redisPromise = redis.ping();

  const [dbStatus, redisStatus] = await Promise.allSettled([dbPromise, redisPromise]);

  res.json({
    success: true,
    services: {
      database: dbStatus.status === "fulfilled" ? "up" : "down",
      redis: redisStatus.status === "fulfilled" ? "up" : "down",
    },
    timestamp: new Date().toISOString(),
  });
});
