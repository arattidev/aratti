import { apiError } from "../../../../../src/lib/http";
import { verifyMagicLinkController } from "../../../../../src/modules/auth/auth.controller";

export async function POST(request: Request) {
  try {
    return await verifyMagicLinkController(request);
  } catch (error) {
    return apiError(error);
  }
}
