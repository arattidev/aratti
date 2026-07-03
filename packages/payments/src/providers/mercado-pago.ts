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
  checkoutMode?: "SANDBOX" | "PRODUCTION";
  successUrl?: string | undefined;
  failureUrl?: string | undefined;
  pendingUrl?: string | undefined;
  notificationUrl?: string | undefined;
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
          success: this.config.successUrl ?? `${this.config.frontendBaseUrl}/payment/success`,
          failure: this.config.failureUrl ?? `${this.config.frontendBaseUrl}/payment/failure`,
          pending: this.config.pendingUrl ?? `${this.config.frontendBaseUrl}/payment/pending`,
        },
        auto_return: "approved",
        ...(this.config.notificationUrl ? { notification_url: this.config.notificationUrl } : {}),
      }),
    });

    const data = await response.json() as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
      [key: string]: unknown;
    };

    if (!response.ok) {
      throw new Error(`Mercado Pago preference creation failed: ${JSON.stringify(data)}`);
    }

    const checkoutUrl = this.config.checkoutMode === "SANDBOX" ? data.sandbox_init_point : data.init_point;

    return {
      ...(data.id ? { externalPreferenceId: data.id } : {}),
      ...(checkoutUrl ? { checkoutUrl } : {}),
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

    const dataId = context.query?.["data.id"] ?? context.query?.id;
    this.assertWebhookSignature(signature, requestId, typeof dataId === "string" ? dataId : dataId?.[0]);

    const payload = JSON.parse(context.rawBody) as {
      action?: string;
      data?: { id?: string };
      type?: string;
    };

    const externalPaymentId = payload.data?.id;

    return {
      shouldAcknowledge: true,
      eventType: payload.action ?? payload.type ?? "unknown",
      paymentStatus: "PENDING",
      payload,
      ...(externalPaymentId ? { externalPaymentId } : {}),
    };
  }

  private assertWebhookSignature(signature: string, requestId: string, dataId?: string): void {
    const signatureParts = Object.fromEntries(
      signature.split(",").flatMap((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) {
          return [];
        }

        const key = part.slice(0, separatorIndex).trim().toLowerCase();
        const value = part.slice(separatorIndex + 1).trim();
        return key && value ? [[key, value]] : [];
      }),
    );
    const timestamp = signatureParts.ts;
    const normalizedIncoming = signatureParts.v1;

    if (!timestamp || !normalizedIncoming || !/^\d+$/.test(timestamp)) {
      throw new Error("Mercado Pago webhook signature malformed");
    }

    const signedTemplate = [
      ...(dataId ? [`id:${dataId}`] : []),
      `request-id:${requestId}`,
      `ts:${timestamp}`,
    ].join(";") + ";";
    const expectedHash = createHmac("sha256", this.config.webhookSecret).update(signedTemplate).digest("hex");
    const incomingBuffer = Buffer.from(normalizedIncoming, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

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
