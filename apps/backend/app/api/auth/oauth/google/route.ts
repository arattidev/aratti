import { apiError } from "../../../../../src/lib/http";
import { oauthGoogleController } from "../../../../../src/modules/auth/auth.controller";

export async function POST(request: Request) {
  try {
    return await oauthGoogleController(request);
  } catch (error) {
    return apiError(error);
  }
}
