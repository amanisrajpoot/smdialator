import { NextRequest } from "next/server";
import { rotateRefreshToken, httpErrors } from "@scheduler/api";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.refreshToken as string | undefined;

    if (!token) {
      throw httpErrors.badRequest("refreshToken is required");
    }

    const newToken = await rotateRefreshToken(token);

    return success({
      refreshToken: newToken,
    });
  } catch (error) {
    return handleError(error);
  }
}
