import { Router } from "express";
import dayjs from "dayjs";
import { schedulePostSchema, updateScheduleStatusSchema } from "@scheduler/common";
import { ScheduledPostStatus, PublishingJobStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { httpErrors } from "../../lib/errors";
import { publishingQueue } from "../../jobs/queues";
import type { PublishingJobData } from "../../jobs/types";
import { recordAudit } from "../../services/audit.service";

export const schedulerRouter = Router();

schedulerRouter.use("/:workspaceId/schedules", authenticate, loadWorkspaceContext("workspaceId"));

schedulerRouter.get("/:workspaceId/schedules", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? dayjs(start as string).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = end ? dayjs(end as string).toDate() : dayjs().add(60, "day").toDate();

    const schedules = await prisma.scheduledPost.findMany({
      where: {
        workspaceId: req.workspace!.id,
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

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
});

schedulerRouter.post(
  "/:workspaceId/schedules",
  requirePermissions("schedule:manage"),
  async (req, res, next) => {
    try {
      const payload = schedulePostSchema.parse(req.body);

      const [content, profile] = await Promise.all([
        prisma.contentItem.findFirst({
          where: {
            id: payload.contentId,
            workspaceId: req.workspace!.id,
          },
        }),
        prisma.socialProfile.findFirst({
          where: {
            id: payload.profileId,
            workspaceId: req.workspace!.id,
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
          workspaceId: req.workspace!.id,
          contentId: content.id,
          campaignId: payload.campaignId,
          profileId: profile.id,
          scheduledFor: payload.scheduledFor,
          localTimezone: payload.timezone,
          status: ScheduledPostStatus.QUEUED,
          metadata: payload.metadata ?? {},
          createdById: req.user!.id,
        },
      });

      const publishingJob = await prisma.publishingJob.create({
        data: {
          scheduledPostId: scheduledPost.id,
          profileId: profile.id,
          status: PublishingJobStatus.QUEUED,
          payload: payload.metadata ?? {},
        },
      });

      const delay = Math.max(0, payload.scheduledFor.getTime() - Date.now());

      const jobData: PublishingJobData = {
        publishingJobId: publishingJob.id,
        scheduledPostId: scheduledPost.id,
        profileId: profile.id,
        workspaceId: req.workspace!.id,
        attempt: 0,
      };

      await publishingQueue.add("publish-post", jobData, {
        delay,
        jobId: publishingJob.id,
      });

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "schedule.created",
        entity: "scheduled_post",
        entityId: scheduledPost.id,
        payload: {
          scheduledFor: payload.scheduledFor,
          profileId: profile.id,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          scheduledPost,
          publishingJobId: publishingJob.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

schedulerRouter.patch(
  "/:workspaceId/schedules/:scheduleId/status",
  requirePermissions("schedule:manage"),
  async (req, res, next) => {
    try {
      const payload = updateScheduleStatusSchema.parse(req.body);
      const scheduleId = req.params.scheduleId;

      const updated = await prisma.scheduledPost.updateMany({
        where: {
          id: scheduleId,
          workspaceId: req.workspace!.id,
        },
        data: {
          status: payload.status,
          failureReason: payload.failureReason,
        },
      });

      if (updated.count === 0) {
        throw httpErrors.notFound("Scheduled post not found");
      }

      await recordAudit({
        workspaceId: req.workspace!.id,
        actorId: req.user!.id,
        action: "schedule.status_changed",
        entity: "scheduled_post",
        entityId: scheduleId,
        payload: payload,
      });

      res.json({
        success: true,
        data: {
          id: scheduleId,
          status: payload.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
