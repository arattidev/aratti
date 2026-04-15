import { apiError } from "../../../../../src/lib/http";
import { updateBusinessOfferController } from "../../../../../src/modules/business/business.controller";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    return await updateBusinessOfferController(request, context.params);
  } catch (error) {
    return apiError(error);
  }
}
