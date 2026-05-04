import { apiError } from "../../../../src/lib/http";
import { createBusinessPayoutController, listBusinessPayoutsController } from "../../../../src/modules/business/business.controller";

export async function GET(request: Request) {
  try {
    return await listBusinessPayoutsController(request);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await createBusinessPayoutController(request);
  } catch (error) {
    return apiError(error);
  }
}
