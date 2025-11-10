import type { Job } from "bullmq";
import { PublishingJobStatus, ScheduledPostStatus } from "@prisma/client";
import { SocialPlatform } from "@scheduler/common";
import { getConnector } from "@connectors";
import type { PublishPayload } from "@connectors";
import { prisma } from "../../config/prisma";
import { logger } from "../../config/logger";
import type { PublishingJobData } from "../types";

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

export async function processPublishingJob(job: Job<PublishingJobData>) {
  const { publishingJobId, scheduledPostId, workspaceId } = job.data;

  const publishingJob = await prisma.publishingJob.findUnique({
    where: { id: publishingJobId },
    include: {
      scheduledPost: {
        include: {
          content: {
            include: {
              versions: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          profile: true,
          workspace: true,
        },
      },
    },
  });

  if (!publishingJob) {
    logger.error({ publishingJobId }, "Publishing job not found");
    return;
  }

  const { scheduledPost } = publishingJob;

  if (!scheduledPost || scheduledPost.workspaceId !== workspaceId) {
    logger.error({ scheduledPostId }, "Scheduled post not found or workspace mismatch");
    await prisma.publishingJob.update({
      where: { id: publishingJobId },
      data: {
        status: PublishingJobStatus.FAILED,
        error: { reason: "Scheduled post not found" },
        finishedAt: new Date(),
      },
    });
    return;
  }

  const profile = scheduledPost.profile;
  const connector = getConnector(profile.platform as unknown as SocialPlatform);

  const latestVersion = scheduledPost.content.versions[0];

  const contentBody = latestVersion?.body ?? scheduledPost.content.summary ?? "";

  const postMetadata = toRecord(scheduledPost.metadata);
  const contentMetadata = toRecord(latestVersion?.prompts);

  const payload: PublishPayload = {
    text: contentBody,
    mediaUrls: (postMetadata.mediaUrls as string[]) ?? undefined,
    linkAttachment: (postMetadata.link as string) ?? undefined,
    firstComment: (postMetadata.firstComment as string) ?? undefined,
    scheduledFor: scheduledPost.scheduledFor,
    timezone: scheduledPost.localTimezone,
    metadata: {
      ...postMetadata,
      ...contentMetadata,
    },
  };

  try {
    await prisma.publishingJob.update({
      where: { id: publishingJobId },
      data: {
        status: PublishingJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    const result = await connector.publish(
      {
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.tokenExpiresAt ?? undefined,
        metadata: toRecord(profile.metadata),
      },
      payload
    );

    await prisma.$transaction([
      prisma.publishingJob.update({
        where: { id: publishingJobId },
        data: {
          status: PublishingJobStatus.SUCCEEDED,
          response: result.rawResponse ?? {},
          finishedAt: new Date(),
        },
      }),
      prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: ScheduledPostStatus.SUCCEEDED,
          metadata: {
            ...postMetadata,
            externalPostId: result.externalPostId,
            externalUrl: result.url,
          },
        },
      }),
    ]);
  } catch (error) {
    logger.error({ error, publishingJobId }, "Failed to publish post");

    await prisma.$transaction([
      prisma.publishingJob.update({
        where: { id: publishingJobId },
        data: {
          status: PublishingJobStatus.FAILED,
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
          },
          finishedAt: new Date(),
        },
      }),
      prisma.scheduledPost.update({
        where: { id: scheduledPostId },
        data: {
          status: ScheduledPostStatus.FAILED,
          failureReason: error instanceof Error ? error.message : "Unknown error",
        },
      }),
    ]);

    throw error;
  }
}
