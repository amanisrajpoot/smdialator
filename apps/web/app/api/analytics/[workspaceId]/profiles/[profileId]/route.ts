import { NextRequest } from "next/server";
import dayjs from "dayjs";
import { prisma } from "@scheduler/api";
import { requireUser, requireWorkspaceContext } from "@api-lib/auth";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string; profileId: string } }) {
  try {
    const { user } = await requireUser(req);
    await requireWorkspaceContext(user.id, params.workspaceId);

    const startParam = req.nextUrl.searchParams.get("start");
    const endParam = req.nextUrl.searchParams.get("end");
    const startDate = startParam ? dayjs(startParam).toDate() : dayjs().subtract(30, "day").toDate();
    const endDate = endParam ? dayjs(endParam).toDate() : new Date();

    const metrics = await prisma.socialMetric.findMany({
      where: {
        profileId: params.profileId,
        profile: {
          workspaceId: params.workspaceId,
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

    return success(metrics);
  } catch (error) {
    return handleError(error);
  }
}
