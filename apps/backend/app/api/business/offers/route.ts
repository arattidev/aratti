import { apiError } from "../../../../src/lib/http";
import { createBusinessOfferController } from "../../../../src/modules/business/business.controller";

export async function POST(request: Request) {
  try {
    return await createBusinessOfferController(request);
  } catch (error) {
    return apiError(error);
  }
}
