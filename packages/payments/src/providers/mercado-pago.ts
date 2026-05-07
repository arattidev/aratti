import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  CreateSplitPreferenceInput,
  CreateSplitPreferenceResult,
  OAuthAuthorizationUrlInput,
  OAuthExchangeInput,
  OAuthExchangeResult,
  OAuthRefreshInput,
  OAuthRevokeInput,
  PaymentProvider,
  RefundPaymentInput,
  RefundPaymentResult,
  WebhookContext,
  WebhookResult,
  WebhookTopic,
} from "../types";

export interface MercadoPagoConfig {
  accessToken: string;
  webhookSecret: string;
  baseUrl?: string;
  authBaseUrl?: string;
  frontendBaseUrl: string;
  clientId?: string;
  clientSecret?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  notificationUrl?: string;
}

const DEFAULT_API_BASE = "https://api.mercadopago.com";
const DEFAULT_AUTH_BASE = "https://auth.mercadopago.com.ar";

interface MerchantOrderInfo {
  id: number | string;
  external_reference?: string;
  payments?: Array<{ id?: number | string; status?: string }>;
  status?: string;
}

export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "MERCADO_PAGO" as const;
  private readonly baseUrl: string;
  private readonly authBaseUrl: string;

  constructor(private readonly config: MercadoPagoConfig) {
    this.baseUrl = config.baseUrl ?? DEFAULT_API_BASE;
    this.authBaseUrl = config.authBaseUrl ?? DEFAULT_AUTH_BASE;
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
    const body = {
      items: [
        {
          id: input.orderId,
          title: `Pack ${input.orderNumber}`,
          quantity: 1,
          currency_id: input.currencyCode,
          unit_price: input.amountArs,
        },
      ],
      external_reference: input.orderId,
      metadata: {
        ...input.metadata,
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
      back_urls: this.buildBackUrls(),
      auto_return: "approved",
      ...(this.config.notificationUrl ? { notification_url: this.config.notificationUrl } : {}),
    };

    const data = await this.fetchJson("/checkout/preferences", {
      method: "POST",
      accessToken: this.config.accessToken,
      idempotencyKey: input.idempotencyKey,
      body,
    });

    return {
      externalPreferenceId: data.id,
      checkoutUrl: data.init_point,
      status: "REQUIRES_ACTION",
      raw: data,
    };
  }

  async createSplitPreference(input: CreateSplitPreferenceInput): Promise<CreateSplitPreferenceResult> {
    if (!input.sellerAccessToken) {
      throw new Error("Mercado Pago split preference requires a seller access token");
    }

    if (!input.applicationId) {
      throw new Error("Mercado Pago split preference requires the marketplace applicationId (CLIENT_ID)");
    }

    const body = {
      items: input.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        currency_id: "ARS",
        unit_price: item.unitPriceArs,
      })),
      marketplace: `MP-MKT-${input.applicationId}`,
      marketplace_fee: input.marketplaceFeeArs,
      external_reference: input.orderId,
      ...(input.payerEmail ? { payer: { email: input.payerEmail } } : {}),
      metadata: {
        ...input.metadata,
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
      back_urls: this.buildBackUrls(),
      auto_return: "approved",
      ...(this.config.notificationUrl ? { notification_url: this.config.notificationUrl } : {}),
    };

    const data = await this.fetchJson("/checkout/preferences", {
      method: "POST",
      accessToken: input.sellerAccessToken,
      idempotencyKey: input.idempotencyKey,
      body,
    });

    return {
      externalPreferenceId: data.id,
      checkoutUrl: data.init_point,
      sandboxCheckoutUrl: data.sandbox_init_point,
      raw: data,
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    return this.fetchPayment(input.externalPaymentId, this.config.accessToken);
  }

  async confirmPaymentWithToken(externalPaymentId: string, accessToken: string): Promise<ConfirmPaymentResult> {
    return this.fetchPayment(externalPaymentId, accessToken);
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const data = await this.fetchJson(`/v1/payments/${input.externalPaymentId}/refunds`, {
      method: "POST",
      accessToken: this.config.accessToken,
      body: {
        amount: input.amountArs,
      },
    });

    return {
      status: "PROCESSING",
      externalRefundId: String(data.id),
      raw: data,
    };
  }

  async fetchMerchantOrder(merchantOrderId: string, accessToken?: string): Promise<MerchantOrderInfo> {
    return this.fetchJson(`/merchant_orders/${merchantOrderId}`, {
      method: "GET",
      accessToken: accessToken ?? this.config.accessToken,
    });
  }

  async webhookHandler(context: WebhookContext): Promise<WebhookResult> {
    const signature = context.headers["x-signature"];
    const requestId = context.headers["x-request-id"];

    if (!signature || !requestId) {
      throw new Error("Missing Mercado Pago webhook signature headers");
    }

    const dataIdFromQuery = readQuerySingle(context.query, "data.id") ?? readQuerySingle(context.query, "id");

    this.assertWebhookSignature(signature, requestId, context.rawBody, dataIdFromQuery);

    let payload: {
      action?: string;
      data?: { id?: string | number };
      type?: string;
      topic?: string;
      resource?: string;
    } = {};

    if (context.rawBody) {
      try {
        payload = JSON.parse(context.rawBody);
      } catch {
        payload = {};
      }
    }

    const topicRaw =
      readQuerySingle(context.query, "topic") ??
      readQuerySingle(context.query, "type") ??
      payload.type ??
      payload.topic ??
      "";

    const topic = normalizeTopic(topicRaw, payload.action);
    const externalId = String(payload.data?.id ?? dataIdFromQuery ?? "");

    const result: WebhookResult = {
      shouldAcknowledge: true,
      eventType: payload.action ?? payload.type ?? topicRaw ?? "unknown",
      topic,
      payload,
    };

    if (topic === "payment" && externalId) {
      result.externalPaymentId = externalId;
    }

    if (topic === "merchant_order" && externalId) {
      result.merchantOrderId = externalId;
    }

    return result;
  }

  // OAuth -----------------------------------------------------------------

  getAuthorizationUrl(input: OAuthAuthorizationUrlInput): string {
    if (!this.config.clientId) {
      throw new Error("Mercado Pago clientId is required to build the authorization URL");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      platform_id: "mp",
      state: input.state,
      redirect_uri: input.redirectUri,
    });

    return `${this.authBaseUrl}/authorization?${params.toString()}`;
  }

  async exchangeCodeForToken(input: OAuthExchangeInput): Promise<OAuthExchangeResult> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("Mercado Pago clientId/clientSecret are required to exchange OAuth code");
    }

    const data = await this.fetchJson("/oauth/token", {
      method: "POST",
      accessToken: this.config.accessToken,
      body: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "authorization_code",
        code: input.code,
        redirect_uri: input.redirectUri,
      },
    });

    return mapOAuthTokenResponse(data);
  }

  async refreshAccessToken(input: OAuthRefreshInput): Promise<OAuthExchangeResult> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("Mercado Pago clientId/clientSecret are required to refresh tokens");
    }

    const data = await this.fetchJson("/oauth/token", {
      method: "POST",
      accessToken: this.config.accessToken,
      body: {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: input.refreshToken,
      },
    });

    return mapOAuthTokenResponse(data);
  }

  async revokeAuthorization(input: OAuthRevokeInput): Promise<void> {
    await this.fetchJson(`/users/${input.mpUserId}/mercadopago_account/unlink`, {
      method: "POST",
      accessToken: input.accessToken,
      body: {},
      allowEmptyResponse: true,
    });
  }

  // Internals -------------------------------------------------------------

  private buildBackUrls(): { success: string; failure: string; pending: string } {
    const fallback = this.config.frontendBaseUrl;
    return {
      success: this.config.successUrl ?? `${fallback}/payment/success`,
      failure: this.config.failureUrl ?? `${fallback}/payment/failure`,
      pending: this.config.pendingUrl ?? `${fallback}/payment/pending`,
    };
  }

  private async fetchPayment(externalPaymentId: string, accessToken: string): Promise<ConfirmPaymentResult> {
    const data = await this.fetchJson(`/v1/payments/${externalPaymentId}`, {
      method: "GET",
      accessToken,
    });

    return {
      status: mapMercadoPagoStatus(data.status),
      raw: data,
    };
  }

  private async fetchJson(
    path: string,
    options: {
      method: "GET" | "POST";
      accessToken: string;
      body?: unknown;
      idempotencyKey?: string;
      allowEmptyResponse?: boolean;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${options.accessToken}`,
      "Content-Type": "application/json",
    };

    if (options.idempotencyKey) {
      headers["X-Idempotency-Key"] = options.idempotencyKey;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });

    const text = await response.text();
    const data = text ? safeParseJson(text) : null;

    if (!response.ok) {
      throw new Error(`Mercado Pago request to ${path} failed (${response.status}): ${text}`);
    }

    if (!options.allowEmptyResponse && data === null) {
      throw new Error(`Mercado Pago request to ${path} returned empty response`);
    }

    return data ?? {};
  }

  private assertWebhookSignature(
    signature: string,
    requestId: string,
    rawBody: string,
    dataId: string | undefined,
  ): void {
    const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const ts = parts["ts"];
    const v1 = parts["v1"];

    if (!v1) {
      throw new Error("Mercado Pago webhook signature malformed");
    }

    const candidates: string[] = [];

    if (ts && dataId) {
      candidates.push(`id:${dataId};request-id:${requestId};ts:${ts};`);
    }

    if (ts) {
      candidates.push(`id:${requestId};request-id:${requestId};ts:${ts};`);
    }

    candidates.push(`id:${requestId};request-body:${rawBody};`);

    const expectedBuffer = Buffer.from(v1);

    const matches = candidates.some((template) => {
      const computed = createHmac("sha256", this.config.webhookSecret).update(template).digest("hex");
      const computedBuffer = Buffer.from(computed);
      return computedBuffer.length === expectedBuffer.length && timingSafeEqual(computedBuffer, expectedBuffer);
    });

    if (!matches) {
      throw new Error("Invalid Mercado Pago webhook signature");
    }
  }
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readQuerySingle(
  query: WebhookContext["query"],
  key: string,
): string | undefined {
  if (!query) return undefined;
  const value = query[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function normalizeTopic(topic: string | undefined, action: string | undefined): WebhookTopic {
  const lowered = (topic ?? "").toLowerCase();
  if (lowered.includes("merchant_order")) return "merchant_order";
  if (lowered.includes("payment")) return "payment";

  const actionLowered = (action ?? "").toLowerCase();
  if (actionLowered.startsWith("payment.")) return "payment";
  if (actionLowered.startsWith("merchant_order.")) return "merchant_order";

  return "unknown";
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

interface MpOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  public_key?: string;
  live_mode: boolean;
  scope: string;
  user_id: number | string;
  expires_in: number;
}

function mapOAuthTokenResponse(data: unknown): OAuthExchangeResult {
  const typed = data as MpOAuthTokenResponse;

  if (!typed.access_token || !typed.refresh_token || typed.user_id === undefined) {
    throw new Error("Mercado Pago OAuth response is missing required fields");
  }

  return {
    accessToken: typed.access_token,
    refreshToken: typed.refresh_token,
    liveMode: Boolean(typed.live_mode),
    scope: typed.scope ?? "",
    mpUserId: String(typed.user_id),
    expiresAt: new Date(Date.now() + (typed.expires_in ?? 0) * 1000),
    raw: data,
    ...(typed.public_key !== undefined ? { publicKey: typed.public_key } : {}),
  };
}
