import { apiError } from "../../../../../src/lib/http";
import { pickupOrderController } from "../../../../../src/modules/orders/orders.controller";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    return await pickupOrderController(request, context.params);
  } catch (error) {
    return apiError(error);
  }
}
