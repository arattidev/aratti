import { apiError } from "../../../../../src/lib/http";
import { updateBusinessOfferController } from "../../../../../src/modules/business/business.controller";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await updateBusinessOfferController(request, params);
  } catch (error) {
    return apiError(error);
  }
}
