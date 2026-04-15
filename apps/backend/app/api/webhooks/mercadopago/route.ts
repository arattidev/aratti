import { apiError } from "../../../../../src/lib/http";
import { mercadoPagoWebhookController } from "../../../../../src/modules/payments/payments.controller";

export async function POST(request: Request) {
  try {
    return await mercadoPagoWebhookController(request);
  } catch (error) {
    return apiError(error);
  }
}
