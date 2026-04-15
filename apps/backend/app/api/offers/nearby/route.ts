import { apiError } from "../../../../src/lib/http";
import { getNearbyOffersController } from "../../../../src/modules/offers/offers.controller";

export async function GET(request: Request) {
  try {
    return await getNearbyOffersController(request);
  } catch (error) {
    return apiError(error);
  }
}
