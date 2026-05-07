export type PaymentProviderName = "MERCADO_PAGO" | "APPLE_PAY" | "STRIPE";

export interface CreatePaymentIntentInput {
  orderId: string;
  orderNumber: string;
  amountArs: number;
  currencyCode: "ARS";
  userEmail?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
}

export interface CreatePaymentIntentResult {
  externalPaymentId?: string;
  externalPreferenceId?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  status: "PENDING" | "REQUIRES_ACTION" | "AUTHORIZED";
  raw: unknown;
}

export interface ConfirmPaymentInput {
  externalPaymentId: string;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentResult {
  status: "SUCCEEDED" | "AUTHORIZED" | "PENDING" | "FAILED";
  raw: unknown;
}

export interface RefundPaymentInput {
  externalPaymentId: string;
  amountArs: number;
  reason: string;
}

export interface RefundPaymentResult {
  status: "PROCESSING" | "SUCCEEDED" | "FAILED";
  externalRefundId?: string;
  raw: unknown;
}

export interface WebhookContext {
  headers: Record<string, string | undefined>;
  rawBody: string;
  query?: Record<string, string | string[] | undefined>;
}

export type WebhookTopic = "payment" | "merchant_order" | "unknown";

export interface WebhookResult {
  shouldAcknowledge: boolean;
  eventType: string;
  topic?: WebhookTopic;
  externalPaymentId?: string;
  merchantOrderId?: string;
  externalOrderId?: string;
  paymentStatus?: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  payload: unknown;
}

export interface SplitPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unitPriceArs: number;
}

export interface CreateSplitPreferenceInput {
  orderId: string;
  orderNumber: string;
  items: SplitPreferenceItem[];
  payerEmail?: string;
  sellerAccessToken: string;
  applicationId: string;
  marketplaceFeeArs: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSplitPreferenceResult {
  externalPreferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
  raw: unknown;
}

export interface OAuthAuthorizationUrlInput {
  state: string;
  redirectUri: string;
}

export interface OAuthExchangeInput {
  code: string;
  redirectUri: string;
}

export interface OAuthExchangeResult {
  accessToken: string;
  refreshToken: string;
  publicKey?: string;
  liveMode: boolean;
  scope: string;
  mpUserId: string;
  expiresAt: Date;
  raw: unknown;
}

export interface OAuthRefreshInput {
  refreshToken: string;
}

export interface OAuthRevokeInput {
  mpUserId: string;
  accessToken: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  webhookHandler(context: WebhookContext): Promise<WebhookResult>;
}
