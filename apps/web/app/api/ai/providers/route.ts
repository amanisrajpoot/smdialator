import { listAiProviders } from "@scheduler/api";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    return success(listAiProviders());
  } catch (error) {
    return handleError(error);
  }
}
