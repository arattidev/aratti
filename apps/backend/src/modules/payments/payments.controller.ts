import { createPaymentBodySchema } from "@aratti/api";

import { apiSuccess } from "../../lib/http";
import { requireAuthContext } from "../../lib/security/auth";
import { applyApiGuard, parseBody } from "../../lib/security/request";
import { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";

const paymentsService = new PaymentsService(new PaymentsRepository());

export async function createPaymentController(request: Request) {
  await applyApiGuard("payments.create");
  const context = await requireAuthContext();
  const body = await parseBody(request, createPaymentBodySchema);

  const data = await paymentsService.createPayment({
    orderId: body.orderId,
    userId: context.userId,
    provider: body.provider,
    idempotencyKey: body.idempotencyKey,
  });

  return apiSuccess(data, 201);
}

export async function mercadoPagoWebhookController(request: Request) {
  await applyApiGuard("payments.webhook.mercadopago");

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  const data = await paymentsService.handleMercadoPagoWebhook({
    rawBody,
    headers,
    query,
  });

  return apiSuccess(data, 200);
}
