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

export class StripeProvider implements PaymentProvider {
  readonly name = "STRIPE" as const;

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    return {
      externalPaymentId: `stripe_pi_${input.orderId}`,
      clientSecret: `stripe_cs_${input.idempotencyKey}`,
      status: "REQUIRES_ACTION",
      raw: input,
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    return {
      status: "PENDING",
      raw: input,
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    return {
      status: "PROCESSING",
      externalRefundId: `stripe_refund_${input.externalPaymentId}`,
      raw: input,
    };
  }

  async webhookHandler(context: WebhookContext): Promise<WebhookResult> {
    const payload = context.rawBody ? JSON.parse(context.rawBody) : {};

    return {
      shouldAcknowledge: true,
      eventType: "stripe.webhook",
      paymentStatus: "PENDING",
      payload,
    };
  }
}
