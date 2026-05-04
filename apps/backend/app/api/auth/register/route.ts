import { apiError } from "../../../../src/lib/http";
import { registerController } from "../../../../src/modules/auth/auth.controller";

export async function POST(request: Request) {
  try {
    return await registerController(request);
  } catch (error) {
    return apiError(error);
  }
}
