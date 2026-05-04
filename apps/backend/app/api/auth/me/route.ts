import { apiError } from "../../../../src/lib/http";
import { meController } from "../../../../src/modules/auth/auth.controller";

export async function GET() {
  try {
    return await meController();
  } catch (error) {
    return apiError(error);
  }
}
