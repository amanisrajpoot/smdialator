import { prisma, publishScheduledPost } from "@scheduler/api";
import { success, handleError } from "@api-lib/errors";
import { PublishingJobStatus, ScheduledPostStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function POST() {
  try {
    const dueJobs = await prisma.publishingJob.findMany({
      where: {
        status: PublishingJobStatus.QUEUED,
        scheduledPost: {
          status: ScheduledPostStatus.QUEUED,
          scheduledFor: {
            lte: new Date(),
          },
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        queuedAt: "asc",
      },
      take: 20,
    });

    let succeeded = 0;
    let failed = 0;

    for (const job of dueJobs) {
      try {
        await publishScheduledPost(job.id);
        succeeded += 1;
      } catch (error) {
        console.error("Failed to publish scheduled post", error);
        failed += 1;
      }
    }

    return success({
      processed: dueJobs.length,
      succeeded,
      failed,
    });
  } catch (error) {
    return handleError(error);
  }
}
