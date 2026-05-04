import { apiError } from "../../../../src/lib/http";
import {
  listBusinessAvailabilityController,
  upsertBusinessAvailabilityController,
} from "../../../../src/modules/business/business.controller";

export async function GET(request: Request) {
  try {
    return await listBusinessAvailabilityController(request);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await upsertBusinessAvailabilityController(request);
  } catch (error) {
    return apiError(error);
  }
}
