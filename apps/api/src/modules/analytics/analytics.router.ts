import { Router } from "express";
import dayjs from "dayjs";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";

export const analyticsRouter = Router();

analyticsRouter.use("/:workspaceId", authenticate, loadWorkspaceContext("workspaceId"));

analyticsRouter.get("/:workspaceId/overview", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? dayjs(start as string).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = end ? dayjs(end as string).toDate() : new Date();

    const metrics = await prisma.socialMetric.groupBy({
      by: ["profileId"],
      where: {
        profile: {
          workspaceId: req.workspace!.id,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        impressions: true,
        reach: true,
        engagements: true,
        clicks: true,
      },
    });

    const totals = metrics.reduce(
      (acc, metric) => ({
        impressions: acc.impressions + (metric._sum.impressions ?? 0),
        reach: acc.reach + (metric._sum.reach ?? 0),
        engagements: acc.engagements + (metric._sum.engagements ?? 0),
        clicks: acc.clicks + (metric._sum.clicks ?? 0),
      }),
      { impressions: 0, reach: 0, engagements: 0, clicks: 0 }
    );

    res.json({
      success: true,
      data: {
        totals,
        breakdown: metrics,
      },
    });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/:workspaceId/profiles/:profileId", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? dayjs(start as string).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = end ? dayjs(end as string).toDate() : new Date();

    const metrics = await prisma.socialMetric.findMany({
      where: {
        profileId: req.params.profileId,
        profile: {
          workspaceId: req.workspace!.id,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        capturedAt: "asc",
      },
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});
