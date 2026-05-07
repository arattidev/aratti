import { apiError } from "../../../../src/lib/http";
import { mpAuthUrlController } from "../../../../src/modules/mercadopago/mercadopago.controller";

export async function GET(request: Request) {
  try {
    return await mpAuthUrlController(request);
  } catch (error) {
    return apiError(error);
  }
}
