import { apiError } from "../../../src/lib/http";
import { createOrderController } from "../../../src/modules/orders/orders.controller";

export async function POST(request: Request) {
  try {
    return await createOrderController(request);
  } catch (error) {
    return apiError(error);
  }
}
