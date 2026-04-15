import { apiError } from "../../../../src/lib/http";
import { createPaymentController } from "../../../../src/modules/payments/payments.controller";

export async function POST(request: Request) {
  try {
    return await createPaymentController(request);
  } catch (error) {
    return apiError(error);
  }
}
