import { PublishingJobStatus, ScheduledPostStatus } from "@prisma/client";
import { SocialPlatform } from "@scheduler/common";
import { getConnector } from "@scheduler/connectors";
import type { PublishPayload } from "@scheduler/connectors";
import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

export async function publishScheduledPost(publishingJobId: string) {
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
        },
      },
    },
  });

  if (!publishingJob || !publishingJob.scheduledPost) {
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

  const scheduledPost = publishingJob.scheduledPost;
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
          response: (result.rawResponse ?? {}) as Prisma.InputJsonValue,
          finishedAt: new Date(),
        },
      }),
      prisma.scheduledPost.update({
        where: { id: scheduledPost.id },
        data: {
          status: ScheduledPostStatus.SUCCEEDED,
          metadata: {
            ...postMetadata,
            externalPostId: result.externalPostId,
            externalUrl: result.url,
          } as Prisma.InputJsonValue,
        },
      }),
    ]);
  } catch (error) {
    await prisma.$transaction([
      prisma.publishingJob.update({
        where: { id: publishingJobId },
        data: {
          status: PublishingJobStatus.FAILED,
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
          } as Prisma.InputJsonValue,
          finishedAt: new Date(),
        },
      }),
      prisma.scheduledPost.update({
        where: { id: scheduledPost.id },
        data: {
          status: ScheduledPostStatus.FAILED,
          failureReason: error instanceof Error ? error.message : "Unknown error",
        },
      }),
    ]);

    throw error;
  }
}
