import { apiError } from "../../../../src/lib/http";
import { getOfferByIdController } from "../../../../src/modules/offers/offers.controller";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await getOfferByIdController(params);
  } catch (error) {
    return apiError(error);
  }
}
