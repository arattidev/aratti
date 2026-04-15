import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  PaymentProvider,
  RefundPaymentInput,
  RefundPaymentResult,
  WebhookContext,
  WebhookResult,
} from "../types";

export interface MercadoPagoConfig {
  accessToken: string;
  webhookSecret: string;
  baseUrl?: string;
  frontendBaseUrl: string;
}

export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "MERCADO_PAGO" as const;
  private readonly baseUrl: string;

  constructor(private readonly config: MercadoPagoConfig) {
    this.baseUrl = config.baseUrl ?? "https://api.mercadopago.com";
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        items: [
          {
            id: input.orderId,
            title: `Pack ${input.orderNumber}`,
            quantity: 1,
            currency_id: input.currencyCode,
            unit_price: input.amountArs,
          },
        ],
        metadata: {
          ...input.metadata,
          order_id: input.orderId,
          order_number: input.orderNumber,
        },
        back_urls: {
          success: `${this.config.frontendBaseUrl}/payment/success`,
          failure: `${this.config.frontendBaseUrl}/payment/failure`,
          pending: `${this.config.frontendBaseUrl}/payment/pending`,
        },
        auto_return: "approved",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago preference creation failed: ${JSON.stringify(data)}`);
    }

    return {
      externalPreferenceId: data.id,
      checkoutUrl: data.init_point,
      status: "REQUIRES_ACTION",
      raw: data,
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${input.externalPaymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago payment fetch failed: ${JSON.stringify(data)}`);
    }

    const status = mapMercadoPagoStatus(data.status);
    return {
      status,
      raw: data,
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${input.externalPaymentId}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountArs,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mercado Pago refund failed: ${JSON.stringify(data)}`);
    }

    return {
      status: "PROCESSING",
      externalRefundId: String(data.id),
      raw: data,
    };
  }

  async webhookHandler(context: WebhookContext): Promise<WebhookResult> {
    const signature = context.headers["x-signature"];
    const requestId = context.headers["x-request-id"];

    if (!signature || !requestId) {
      throw new Error("Missing Mercado Pago webhook signature headers");
    }

    this.assertWebhookSignature(signature, requestId, context.rawBody);

    const payload = JSON.parse(context.rawBody) as {
      action?: string;
      data?: { id?: string };
      type?: string;
    };

    const externalPaymentId = payload.data?.id;

    return {
      shouldAcknowledge: true,
      eventType: payload.action ?? payload.type ?? "unknown",
      externalPaymentId,
      paymentStatus: "PENDING",
      payload,
    };
  }

  private assertWebhookSignature(signature: string, requestId: string, rawBody: string): void {
    const signedTemplate = `id:${requestId};request-body:${rawBody};`;

    const expectedHash = createHmac("sha256", this.config.webhookSecret).update(signedTemplate).digest("hex");

    const normalizedIncoming = signature.split(",").find((part) => part.trim().startsWith("v1="))?.split("=")[1];

    if (!normalizedIncoming) {
      throw new Error("Mercado Pago webhook signature malformed");
    }

    const incomingBuffer = Buffer.from(normalizedIncoming);
    const expectedBuffer = Buffer.from(expectedHash);

    if (incomingBuffer.length !== expectedBuffer.length || !timingSafeEqual(incomingBuffer, expectedBuffer)) {
      throw new Error("Invalid Mercado Pago webhook signature");
    }
  }
}

function mapMercadoPagoStatus(status: string): ConfirmPaymentResult["status"] {
  if (status === "approved") {
    return "SUCCEEDED";
  }

  if (status === "authorized") {
    return "AUTHORIZED";
  }

  if (status === "in_process" || status === "pending") {
    return "PENDING";
  }

  return "FAILED";
}
