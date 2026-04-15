import { apiError } from "../../../../../src/lib/http";
import { listPendingBusinessesController } from "../../../../../src/modules/admin/admin.controller";

export async function GET() {
  try {
    return await listPendingBusinessesController();
  } catch (error) {
    return apiError(error);
  }
}
