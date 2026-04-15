import { apiError } from "../../../../../../src/lib/http";
import { approveRefundController } from "../../../../../../src/modules/admin/admin.controller";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    return await approveRefundController(request, context.params);
  } catch (error) {
    return apiError(error);
  }
}
