import { apiError } from "../../../../src/lib/http";
import { createBusinessOfferController, listBusinessOffersController } from "../../../../src/modules/business/business.controller";

export async function POST(request: Request) {
  try {
    return await createBusinessOfferController(request);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  try {
    return await listBusinessOffersController(request);
  } catch (error) {
    return apiError(error);
  }
}
