import { NextRequest } from "next/server";
import dayjs from "dayjs";
import { schedulePostSchema } from "@scheduler/common";
import { requireUser, requireWorkspaceContext, ensurePermissions } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";
import { prisma, httpErrors, recordAudit } from "@scheduler/api";
import type { Prisma } from "@prisma/client";
import { ScheduledPostStatus, PublishingJobStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const startParam = req.nextUrl.searchParams.get("start");
    const endParam = req.nextUrl.searchParams.get("end");
    const startDate = startParam ? dayjs(startParam).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = endParam ? dayjs(endParam).toDate() : dayjs().add(60, "day").toDate();

    const schedules = await prisma.scheduledPost.findMany({
      where: {
        workspaceId: params.workspaceId,
        scheduledFor: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        content: {
          include: {
            versions: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        profile: true,
        publishingJobs: true,
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    return success(schedules);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    const { membership } = await requireWorkspaceContext(user.id, params.workspaceId);
    ensurePermissions(membership.role, ["schedule:manage"]);

    const body = await req.json();
    const payload = schedulePostSchema.parse(body);

    const [content, profile] = await Promise.all([
      prisma.contentItem.findFirst({
        where: {
          id: payload.contentId,
          workspaceId: params.workspaceId,
        },
      }),
      prisma.socialProfile.findFirst({
        where: {
          id: payload.profileId,
          workspaceId: params.workspaceId,
        },
      }),
    ]);

    if (!content) {
      throw httpErrors.notFound("Content item not found in workspace");
    }
    if (!profile) {
      throw httpErrors.notFound("Social profile not found in workspace");
    }

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        workspaceId: params.workspaceId,
        contentId: content.id,
        campaignId: payload.campaignId,
        profileId: profile.id,
        scheduledFor: payload.scheduledFor,
        localTimezone: payload.timezone,
        status: ScheduledPostStatus.QUEUED,
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue,
        createdById: user.id,
      },
    });

    await prisma.publishingJob.create({
      data: {
        scheduledPostId: scheduledPost.id,
        profileId: profile.id,
        status: PublishingJobStatus.QUEUED,
        payload: (payload.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit({
      workspaceId: params.workspaceId,
      actorId: user.id,
      action: "schedule.created",
      entity: "scheduled_post",
      entityId: scheduledPost.id,
      payload: {
        scheduledFor: payload.scheduledFor,
        profileId: profile.id,
      },
    });

    return success(
      {
        scheduledPost,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
