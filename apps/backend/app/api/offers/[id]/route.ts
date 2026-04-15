import { apiError } from "../../../../src/lib/http";
import { getOfferByIdController } from "../../../../src/modules/offers/offers.controller";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    return await getOfferByIdController(context.params);
  } catch (error) {
    return apiError(error);
  }
}
