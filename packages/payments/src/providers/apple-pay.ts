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

export class ApplePayProvider implements PaymentProvider {
  readonly name = "APPLE_PAY" as const;

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    return {
      externalPaymentId: `apple_pay_${input.orderId}`,
      clientSecret: `apple_pay_client_secret_${input.idempotencyKey}`,
      status: "REQUIRES_ACTION",
      raw: {
        amountArs: input.amountArs,
        orderId: input.orderId,
      },
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    return {
      status: "SUCCEEDED",
      raw: {
        externalPaymentId: input.externalPaymentId,
      },
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      status: "PROCESSING",
      externalRefundId: `apple_refund_${input.externalPaymentId}`,
      raw: input,
    };
  }

  async webhookHandler(context: WebhookContext): Promise<WebhookResult> {
    const payload = context.rawBody ? JSON.parse(context.rawBody) : {};

    return {
      shouldAcknowledge: true,
      eventType: "apple_pay.webhook",
      paymentStatus: "SUCCEEDED",
      payload,
    };
  }
}
