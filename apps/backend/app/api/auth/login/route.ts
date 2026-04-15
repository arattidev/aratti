import { apiError } from "../../../../src/lib/http";
import { loginController } from "../../../../src/modules/auth/auth.controller";

export async function POST(request: Request) {
  try {
    return await loginController(request);
  } catch (error) {
    return apiError(error);
  }
}
