import { apiError } from "../../../../src/lib/http";
import { mpDisconnectController } from "../../../../src/modules/mercadopago/mercadopago.controller";

export async function POST(request: Request) {
  try {
    return await mpDisconnectController(request);
  } catch (error) {
    return apiError(error);
  }
}
