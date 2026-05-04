import { apiError } from "../../../../../src/lib/http";
import { requestMagicLinkController } from "../../../../../src/modules/auth/auth.controller";

export async function POST(request: Request) {
  try {
    return await requestMagicLinkController(request);
  } catch (error) {
    return apiError(error);
  }
}
