import { apiError } from "../../../../../src/lib/http";
import { listFraudFlagsController } from "../../../../../src/modules/admin/admin.controller";

export async function GET() {
  try {
    return await listFraudFlagsController();
  } catch (error) {
    return apiError(error);
  }
}
