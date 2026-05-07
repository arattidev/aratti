import { MercadoPagoProvider } from "@aratti/payments";
import type { PaymentProvider as PaymentProviderName } from "@aratti/types";
import { prisma } from "@aratti/db";

import { createAuditLog } from "../../lib/audit";
import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";
import { createMercadoPagoProvider } from "../mercadopago/mercadopago.factory";
import { MercadoPagoRepository } from "../mercadopago/mercadopago.repository";
import { MercadoPagoService } from "../mercadopago/mercadopago.service";
import { PaymentsRepository } from "./payments.repository";

interface OrderForPayment {
  id: string;
  orderNumber: string;
  userId: string;
  businessId: string;
  offerId: string;
  totalArs: number;
  subtotalArs: number;
  serviceFeeArs: number;
  user: { email: string };
}

export class PaymentsService {
  private readonly mercadoPagoService: MercadoPagoService;

  constructor(private readonly paymentsRepository: PaymentsRepository) {
    this.mercadoPagoService = new MercadoPagoService(new MercadoPagoRepository());
  }

  async createPayment(input: {
    orderId: string;
    userId: string;
    provider: PaymentProviderName;
    idempotencyKey: string;
  }) {
    const order = await this.paymentsRepository.findOrderById(input.orderId);

    if (!order || order.deletedAt || order.userId !== input.userId) {
      throw new HttpError(404, "order_not_found", "Order not found");
    }

    const existingPayment = await this.paymentsRepository.findPaymentByIdempotencyKey(input.idempotencyKey);
    if (existingPayment) {
      return {
        paymentId: existingPayment.id,
        provider: existingPayment.provider,
        status: existingPayment.status,
      };
    }

    if (env.PAYMENTS_MODE === "MOCK") {
      return this.createMockPayment(order as OrderForPayment, input);
    }

    if (input.provider === "MERCADO_PAGO") {
      return this.createMercadoPagoSplitPayment(order as OrderForPayment, input);
    }

    return this.createGenericProviderPayment(order as OrderForPayment, input);
  }

  private async createMockPayment(order: OrderForPayment, input: { userId: string; provider: PaymentProviderName; idempotencyKey: string }) {
    const payment = await this.paymentsRepository.createPayment({
      orderId: order.id,
      userId: input.userId,
      provider: input.provider,
      amountArs: order.totalArs,
      status: "SUCCEEDED",
      idempotencyKey: input.idempotencyKey,
      providerPaymentId: `mock_pi_${order.id}`,
      providerPreferenceId: `mock_pref_${order.id}`,
      marketplaceFeeArs: order.serviceFeeArs,
      sellerAmountArs: order.subtotalArs,
      metadata: { mode: "MOCK" },
    });

    await this.paymentsRepository.updateOrderStatus(order.id, "CONFIRMED");

    await createAuditLog({
      actorUserId: input.userId,
      actorRole: "USER",
      action: "payment_intent_created",
      entityType: "payment",
      entityId: payment.id,
      metadata: {
        provider: input.provider,
        orderId: order.id,
        mode: "MOCK",
      },
    });

    return {
      paymentId: payment.id,
      provider: payment.provider,
      status: payment.status,
      checkoutUrl: `https://mock-payments.local/checkout/${payment.id}`,
      clientSecret: `mock_cs_${payment.id}`,
    };
  }

  private async createMercadoPagoSplitPayment(
    order: OrderForPayment,
    input: { userId: string; provider: PaymentProviderName; idempotencyKey: string },
  ) {
    if (!env.MERCADO_PAGO_CLIENT_ID) {
      throw new HttpError(500, "mp_not_configured", "MERCADO_PAGO_CLIENT_ID es obligatorio para split payments");
    }

    const { accessToken: sellerAccessToken } = await this.mercadoPagoService.getValidAccessTokenForBusiness(order.businessId);

    const provider = createMercadoPagoProvider();
    const marketplaceFeeArs = order.serviceFeeArs;
    const sellerAmountArs = order.totalArs - marketplaceFeeArs;

    const preference = await provider.createSplitPreference({
      orderId: order.id,
      orderNumber: order.orderNumber,
      sellerAccessToken,
      applicationId: env.MERCADO_PAGO_CLIENT_ID,
      marketplaceFeeArs,
      idempotencyKey: input.idempotencyKey,
      items: [
        {
          id: order.offerId,
          title: `Pack ${order.orderNumber}`,
          quantity: 1,
          unitPriceArs: order.totalArs,
        },
      ],
      payerEmail: order.user.email,
      metadata: {
        user_id: order.userId,
        business_id: order.businessId,
      },
    });

    const payment = await this.paymentsRepository.createPayment({
      orderId: order.id,
      userId: input.userId,
      provider: "MERCADO_PAGO",
      amountArs: order.totalArs,
      status: "REQUIRES_ACTION",
      idempotencyKey: input.idempotencyKey,
      providerPreferenceId: preference.externalPreferenceId,
      marketplaceFeeArs,
      sellerAmountArs,
      metadata: preference.raw as Record<string, unknown>,
    });

    await createAuditLog({
      actorUserId: input.userId,
      actorRole: "USER",
      action: "payment_intent_created",
      entityType: "payment",
      entityId: payment.id,
      metadata: {
        provider: "MERCADO_PAGO",
        orderId: order.id,
        marketplaceFeeArs,
        sellerAmountArs,
        liveMode: env.PAYMENTS_MODE === "LIVE",
      },
    });

    return {
      paymentId: payment.id,
      provider: payment.provider,
      status: payment.status,
      checkoutUrl: preference.checkoutUrl,
      sandboxCheckoutUrl: preference.sandboxCheckoutUrl,
    };
  }

  private async createGenericProviderPayment(
    order: OrderForPayment,
    input: { userId: string; provider: PaymentProviderName; idempotencyKey: string },
  ) {
    // Apple Pay / Stripe / fallback. Reuses the legacy createPaymentIntent contract.
    const { createPaymentProvider } = await import("@aratti/payments");
    const provider = createPaymentProvider(input.provider, {
      mercadoPago: {
        accessToken: env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
        webhookSecret: env.MERCADO_PAGO_WEBHOOK_SECRET ?? "",
        frontendBaseUrl: env.API_BASE_URL ?? "https://example.com",
      },
    });

    const createdIntent = await provider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountArs: order.totalArs,
      currencyCode: "ARS",
      userEmail: order.user.email,
      idempotencyKey: input.idempotencyKey,
      metadata: { user_id: order.userId },
    });

    const paymentInput = {
      orderId: order.id,
      userId: input.userId,
      provider: input.provider,
      amountArs: order.totalArs,
      status: createdIntent.status,
      idempotencyKey: input.idempotencyKey,
      metadata: createdIntent.raw as Record<string, unknown>,
      ...(createdIntent.externalPaymentId ? { providerPaymentId: createdIntent.externalPaymentId } : {}),
      ...(createdIntent.externalPreferenceId ? { providerPreferenceId: createdIntent.externalPreferenceId } : {}),
    } as const;

    const payment = await this.paymentsRepository.createPayment(paymentInput);

    await createAuditLog({
      actorUserId: input.userId,
      actorRole: "USER",
      action: "payment_intent_created",
      entityType: "payment",
      entityId: payment.id,
      metadata: { provider: input.provider, orderId: order.id },
    });

    return {
      paymentId: payment.id,
      provider: payment.provider,
      status: payment.status,
      checkoutUrl: createdIntent.checkoutUrl,
      clientSecret: createdIntent.clientSecret,
    };
  }

  async handleMercadoPagoWebhook(input: {
    rawBody: string;
    headers: Record<string, string | undefined>;
    query?: Record<string, string | string[] | undefined>;
  }) {
    if (env.PAYMENTS_MODE === "MOCK") {
      return { received: true, ignored: true, mode: "MOCK" };
    }

    const provider = createMercadoPagoProvider();

    const webhook = await provider.webhookHandler({
      rawBody: input.rawBody,
      headers: input.headers,
      ...(input.query ? { query: input.query } : {}),
    });

    if (webhook.topic === "merchant_order" && webhook.merchantOrderId) {
      return this.processMerchantOrderEvent(provider, webhook.merchantOrderId);
    }

    if (webhook.topic === "payment" && webhook.externalPaymentId) {
      return this.processPaymentEvent(provider, webhook.externalPaymentId);
    }

    return { received: true, ignored: true };
  }

  private async processPaymentEvent(provider: MercadoPagoProvider, externalPaymentId: string) {
    const existing = await this.paymentsRepository.findPaymentByProviderExternal("MERCADO_PAGO", externalPaymentId);

    const paymentRecord = existing
      ? existing
      : await this.findPaymentForUnknownExternal(provider, externalPaymentId);

    if (!paymentRecord) {
      return { received: true, ignored: true };
    }

    const sellerToken = await this.mercadoPagoService.getValidAccessTokenForBusiness(
      (await prisma.order.findUniqueOrThrow({
        where: { id: paymentRecord.orderId },
        select: { businessId: true },
      })).businessId,
    );

    const confirmation = await provider.confirmPaymentWithToken(externalPaymentId, sellerToken.accessToken);

    const mappedStatus = mapConfirmationStatus(confirmation.status);

    await this.paymentsRepository.updatePaymentStatusById(paymentRecord.id, {
      status: mappedStatus,
      providerPaymentId: externalPaymentId,
      metadata: confirmation.raw,
    });

    if (mappedStatus === "SUCCEEDED") {
      await this.handleOrderConfirmed(paymentRecord.orderId);
    }

    if (mappedStatus === "PENDING") {
      await this.paymentsRepository.updateOrderStatus(paymentRecord.orderId, "PENDING_PAYMENT");
    }

    await createAuditLog({
      action: "mp_webhook_processed",
      entityType: "payment",
      entityId: paymentRecord.id,
      metadata: {
        topic: "payment",
        externalPaymentId,
        status: mappedStatus,
      },
    });

    return {
      received: true,
      paymentId: paymentRecord.id,
      status: mappedStatus,
    };
  }

  private async processMerchantOrderEvent(provider: MercadoPagoProvider, merchantOrderId: string) {
    const existingByMerchant = await this.paymentsRepository.findPaymentByMerchantOrderId(merchantOrderId);

    let payment = existingByMerchant;
    let businessId: string | null = null;

    if (!payment) {
      const merchantOrder = await provider.fetchMerchantOrder(merchantOrderId).catch(() => null);
      if (!merchantOrder?.external_reference) {
        return { received: true, ignored: true };
      }

      const order = await prisma.order.findUnique({
        where: { id: merchantOrder.external_reference },
        select: { id: true, businessId: true },
      });

      if (!order) {
        return { received: true, ignored: true };
      }

      businessId = order.businessId;
      payment = await this.paymentsRepository.findPendingPaymentByOrderId(order.id);

      if (!payment) {
        return { received: true, ignored: true };
      }
    }

    if (!businessId) {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
        select: { businessId: true },
      });
      businessId = order?.businessId ?? null;
    }

    if (!businessId) {
      return { received: true, ignored: true };
    }

    const sellerToken = await this.mercadoPagoService.getValidAccessTokenForBusiness(businessId);
    const merchantOrder = await provider.fetchMerchantOrder(merchantOrderId, sellerToken.accessToken);

    const approvedPayment = (merchantOrder.payments ?? []).find((p) => p.status === "approved" && p.id !== undefined);

    if (approvedPayment?.id) {
      const confirmation = await provider.confirmPaymentWithToken(String(approvedPayment.id), sellerToken.accessToken);
      const mappedStatus = mapConfirmationStatus(confirmation.status);

      await this.paymentsRepository.updatePaymentStatusById(payment.id, {
        status: mappedStatus,
        providerPaymentId: String(approvedPayment.id),
        merchantOrderId,
        metadata: confirmation.raw,
      });

      if (mappedStatus === "SUCCEEDED") {
        await this.handleOrderConfirmed(payment.orderId);
      }
    } else {
      await this.paymentsRepository.updatePaymentStatusById(payment.id, {
        status: payment.status,
        merchantOrderId,
        metadata: merchantOrder,
      });
    }

    await createAuditLog({
      action: "mp_webhook_processed",
      entityType: "payment",
      entityId: payment.id,
      metadata: {
        topic: "merchant_order",
        merchantOrderId,
      },
    });

    return {
      received: true,
      paymentId: payment.id,
      merchantOrderId,
    };
  }

  private async findPaymentForUnknownExternal(provider: MercadoPagoProvider, externalPaymentId: string) {
    // Best-effort: when a payment notification arrives before we stored providerPaymentId,
    // resolve via /v1/payments/:id metadata.order_id using the platform token (read-only).
    try {
      const platformConfirmation = await provider.confirmPayment({ externalPaymentId });
      const raw = platformConfirmation.raw as { metadata?: { order_id?: string } } | null;
      const orderId = raw?.metadata?.order_id;
      if (!orderId) return null;
      return this.paymentsRepository.findPendingPaymentByOrderId(orderId);
    } catch {
      return null;
    }
  }

  private async handleOrderConfirmed(orderId: string) {
    await this.paymentsRepository.updateOrderStatus(orderId, "CONFIRMED");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        business: { select: { ownerUserId: true } },
      },
    });

    if (!order) return;

    await prisma.notification.createMany({
      data: [
        {
          userId: order.userId,
          type: "ORDER_CONFIRMED",
          channel: "PUSH",
          status: "QUEUED",
          title: "Pedido confirmado",
          body: "Tu pack está confirmado. Retirá dentro del horario publicado.",
          payload: { orderId: order.id },
        },
        {
          userId: order.business.ownerUserId,
          type: "BUSINESS_NEW_ORDER",
          channel: "PUSH",
          status: "QUEUED",
          title: "Nueva orden",
          body: "Tenés una nueva reserva confirmada en tu local.",
          payload: { orderId: order.id },
        },
      ],
    });
  }
}

function mapConfirmationStatus(status: string): "SUCCEEDED" | "FAILED" | "AUTHORIZED" | "PENDING" {
  if (status === "SUCCEEDED") return "SUCCEEDED";
  if (status === "FAILED") return "FAILED";
  if (status === "AUTHORIZED") return "AUTHORIZED";
  return "PENDING";
}
