import { NextRequest } from "next/server";
import { revokeRefreshToken } from "@scheduler/api";
import { successNoData, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.refreshToken as string | undefined;
    if (token) {
      await revokeRefreshToken(token);
    }
    return successNoData();
  } catch (error) {
    return handleError(error);
  }
}
