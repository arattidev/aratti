import { z } from "zod";

import { apiSuccess } from "../../lib/http";
import { requireAuthContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody } from "../../lib/security/request";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsService } from "./notifications.service";

const testPushBodySchema = z.object({
  orderId: z.string().uuid(),
});

const notificationsService = new NotificationsService(new NotificationsRepository());

export async function listNotificationsController() {
  await applyApiGuard("notifications.list");
  const context = await requireAuthContext();
  const data = await notificationsService.listNotifications(context.userId);
  return apiSuccess(data);
}

export async function testOrderConfirmedPushController(request: Request) {
  await applyApiGuard("notifications.test.push");
  const context = await requireAuthContext();
  const body = await parseBody(request, testPushBodySchema);
  const data = await notificationsService.pushOrderConfirmed(context.userId, body.orderId);
  return apiSuccess(data, 201);
}
