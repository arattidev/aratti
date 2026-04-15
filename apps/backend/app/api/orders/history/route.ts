import { apiError } from "../../../../src/lib/http";
import { listOrderHistoryController } from "../../../../src/modules/orders/orders.controller";

export async function GET(request: Request) {
  try {
    return await listOrderHistoryController(request);
  } catch (error) {
    return apiError(error);
  }
}
