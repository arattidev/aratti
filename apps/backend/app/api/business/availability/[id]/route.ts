import { apiError } from "../../../../../src/lib/http";
import { updateBusinessAvailabilityController } from "../../../../../src/modules/business/business.controller";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await updateBusinessAvailabilityController(request, params);
  } catch (error) {
    return apiError(error);
  }
}
