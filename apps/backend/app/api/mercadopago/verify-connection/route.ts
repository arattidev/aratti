import { apiError } from "../../../../src/lib/http";
import { mpVerifyConnectionController } from "../../../../src/modules/mercadopago/mercadopago.controller";

export async function GET(request: Request) {
  try {
    return await mpVerifyConnectionController(request);
  } catch (error) {
    return apiError(error);
  }
}
