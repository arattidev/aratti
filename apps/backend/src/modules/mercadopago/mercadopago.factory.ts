import { MercadoPagoProvider, type MercadoPagoConfig } from "@aratti/payments";

import { env } from "../../lib/env";

export function createMercadoPagoProvider(): MercadoPagoProvider {
  const config: MercadoPagoConfig = {
    accessToken: env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
    webhookSecret: env.MERCADO_PAGO_WEBHOOK_SECRET ?? "",
    frontendBaseUrl: env.API_BASE_URL ?? "https://example.com",
    ...(env.MERCADO_PAGO_CLIENT_ID ? { clientId: env.MERCADO_PAGO_CLIENT_ID } : {}),
    ...(env.MERCADO_PAGO_CLIENT_SECRET ? { clientSecret: env.MERCADO_PAGO_CLIENT_SECRET } : {}),
    ...(env.MERCADO_PAGO_SUCCESS_URL ? { successUrl: env.MERCADO_PAGO_SUCCESS_URL } : {}),
    ...(env.MERCADO_PAGO_FAILURE_URL ? { failureUrl: env.MERCADO_PAGO_FAILURE_URL } : {}),
    ...(env.MERCADO_PAGO_PENDING_URL ? { pendingUrl: env.MERCADO_PAGO_PENDING_URL } : {}),
    ...(env.MERCADO_PAGO_WEBHOOK_URL ? { notificationUrl: env.MERCADO_PAGO_WEBHOOK_URL } : {}),
  };

  return new MercadoPagoProvider(config);
}
