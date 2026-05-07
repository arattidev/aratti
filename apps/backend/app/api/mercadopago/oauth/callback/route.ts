import { apiError } from "../../../../../src/lib/http";
import { mpOAuthCallbackController } from "../../../../../src/modules/mercadopago/mercadopago.controller";

export async function GET(request: Request) {
  try {
    return await mpOAuthCallbackController(request);
  } catch (error) {
    return apiError(error);
  }
}
