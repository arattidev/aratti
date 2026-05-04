import { apiError } from "../../../../../../src/lib/http";
import { approveRefundController } from "../../../../../../src/modules/admin/admin.controller";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await approveRefundController(request, params);
  } catch (error) {
    return apiError(error);
  }
}
