import { apiError } from "../../../src/lib/http";
import {
  listNotificationsController,
  testOrderConfirmedPushController,
} from "../../../src/modules/notifications/notifications.controller";

export async function GET() {
  try {
    return await listNotificationsController();
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await testOrderConfirmedPushController(request);
  } catch (error) {
    return apiError(error);
  }
}
