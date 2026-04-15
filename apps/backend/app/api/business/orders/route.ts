import { apiError } from "../../../../src/lib/http";
import { listBusinessOrdersController } from "../../../../src/modules/business/business.controller";

export async function GET(request: Request) {
  try {
    return await listBusinessOrdersController(request);
  } catch (error) {
    return apiError(error);
  }
}
