import { NextRequest } from "next/server";
import dayjs from "dayjs";
import { prisma } from "@scheduler/api";
import { requireUser, requireWorkspaceContext } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const startParam = req.nextUrl.searchParams.get("start");
    const endParam = req.nextUrl.searchParams.get("end");
    const startDate = startParam ? dayjs(startParam).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = endParam ? dayjs(endParam).toDate() : new Date();

    const metrics = await prisma.socialMetric.groupBy({
      by: ["profileId"],
      where: {
        profile: {
          workspaceId: params.workspaceId,
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

    type MetricsGroup = (typeof metrics)[number];
    const totals = metrics.reduce(
      (acc: { impressions: number; reach: number; engagements: number; clicks: number }, metric: MetricsGroup) => ({
        impressions: acc.impressions + (metric._sum.impressions ?? 0),
        reach: acc.reach + (metric._sum.reach ?? 0),
        engagements: acc.engagements + (metric._sum.engagements ?? 0),
        clicks: acc.clicks + (metric._sum.clicks ?? 0),
      }),
      { impressions: 0, reach: 0, engagements: 0, clicks: 0 }
    );

    return success({
      totals,
      breakdown: metrics,
    });
  } catch (error) {
    return handleError(error);
  }
}
