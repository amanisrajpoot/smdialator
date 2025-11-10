import { listConnectors } from "@scheduler/connectors";
import { success, handleError } from "@api-lib/errors";

export const runtime = "nodejs";

export async function GET() {
  try {
    return success(listConnectors());
  } catch (error) {
    return handleError(error);
  }
}
