import { NextRequest } from "next/server";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { platform: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log(`Received social webhook from ${params.platform}`, body);
    return success({ received: true });
  } catch (error) {
    return handleError(error);
  }
}
