import { createHmac } from "node:crypto";

import { MercadoPagoProvider } from "@aratti/payments";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("MercadoPagoProvider", () => {
  it("uses the sandbox checkout URL when sandbox mode is configured", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "preference-1",
          init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect",
          sandbox_init_point: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    const provider = createProvider({ checkoutMode: "SANDBOX" });
    const result = await provider.createPaymentIntent({
      orderId: "order-1",
      orderNumber: "A-1",
      amountArs: 100,
      currencyCode: "ARS",
      idempotencyKey: "idempotency-1",
    });

    expect(result.checkoutUrl).toContain("sandbox.mercadopago.com.ar");
  });

  it("uses the production checkout URL when production mode is configured", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "preference-2",
          init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect",
          sandbox_init_point: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    const provider = createProvider({ checkoutMode: "PRODUCTION" });
    const result = await provider.createPaymentIntent({
      orderId: "order-2",
      orderNumber: "A-2",
      amountArs: 100,
      currencyCode: "ARS",
      idempotencyKey: "idempotency-2",
    });

    expect(result.checkoutUrl).toContain("www.mercadopago.com.ar");
  });

  it("validates the documented data.id webhook manifest", async () => {
    const secret = "webhook-test-secret";
    const requestId = "request-1";
    const dataId = "123456";
    const timestamp = "1704908010";
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
    const hash = createHmac("sha256", secret).update(manifest).digest("hex");
    const provider = createProvider({ webhookSecret: secret });

    await expect(
      provider.webhookHandler({
        rawBody: JSON.stringify({ type: "payment", data: { id: dataId } }),
        headers: {
          "x-signature": `ts=${timestamp},v1=${hash}`,
          "x-request-id": requestId,
        },
        query: { "data.id": dataId },
      }),
    ).resolves.toMatchObject({
      externalPaymentId: dataId,
      shouldAcknowledge: true,
    });
  });
});

function createProvider(
  overrides: Partial<ConstructorParameters<typeof MercadoPagoProvider>[0]> = {},
) {
  return new MercadoPagoProvider({
    accessToken: "access-token",
    webhookSecret: "webhook-secret",
    frontendBaseUrl: "https://example.com",
    ...overrides,
  });
}
