import { NextRequest } from "next/server";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("Received n8n webhook", body);
    return success({ received: true });
  } catch (error) {
    return handleError(error);
  }
}
