import { apiError } from "../../../../../src/lib/http";
import { pickupOrderController } from "../../../../../src/modules/orders/orders.controller";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await pickupOrderController(request, params);
  } catch (error) {
    return apiError(error);
  }
}
