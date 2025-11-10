import { Queue, Worker, QueueScheduler } from "bullmq";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { logger } from "../config/logger";
import type { PublishingJobData } from "./types";
import { processPublishingJob } from "./workers/publishing.worker";

export const publishingQueue = new Queue<PublishingJobData>("publishing", {
  connection: redis,
  prefix: env.BULLMQ_PREFIX,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 30_000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

let initialized = false;

export async function initQueues() {
  if (initialized) {
    return;
  }

  const scheduler = new QueueScheduler(publishingQueue.name, {
    connection: redis,
    prefix: env.BULLMQ_PREFIX,
  });

  scheduler.on("failed", (jobId, failedReason) => {
    logger.error({ jobId, failedReason }, "Publishing queue job failed");
  });

  await scheduler.waitUntilReady();

  const worker = new Worker(
    publishingQueue.name,
    async (job) => {
      await processPublishingJob(job);
    },
    {
      connection: redis,
      prefix: env.BULLMQ_PREFIX,
      concurrency: env.JOB_CONCURRENCY,
    }
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Publishing job failed");
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Publishing job completed");
  });

  initialized = true;
}
