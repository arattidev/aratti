import { createPaymentProvider } from "@aratti/payments";
import type { PaymentProvider as PaymentProviderName } from "@aratti/types";
import { prisma } from "@aratti/db";

import { createAuditLog } from "../../lib/audit";
import { env } from "../../lib/env";
import { HttpError } from "../../lib/errors";
import { PaymentsRepository } from "./payments.repository";

export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

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
      const payment = await this.paymentsRepository.createPayment({
        orderId: order.id,
        userId: input.userId,
        provider: input.provider,
        amountArs: order.totalArs,
        status: "SUCCEEDED",
        idempotencyKey: input.idempotencyKey,
        providerPaymentId: `mock_pi_${order.id}`,
        providerPreferenceId: `mock_pref_${order.id}`,
        metadata: {
          mode: "MOCK",
        },
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

    const provider = createPaymentProvider(input.provider, {
      mercadoPago: {
        accessToken: env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
        webhookSecret: env.MERCADO_PAGO_WEBHOOK_SECRET ?? "",
        frontendBaseUrl: env.API_BASE_URL ?? "https://example.com",
        checkoutMode: env.MERCADO_PAGO_CHECKOUT_MODE,
        successUrl: env.MERCADO_PAGO_SUCCESS_URL,
        failureUrl: env.MERCADO_PAGO_FAILURE_URL,
        pendingUrl: env.MERCADO_PAGO_PENDING_URL,
        notificationUrl: env.MERCADO_PAGO_WEBHOOK_URL,
      },
    });

    const createdIntent = await provider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountArs: order.totalArs,
      currencyCode: "ARS",
      userEmail: order.user.email,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        user_id: order.userId,
      },
    });

    const paymentInput: {
      orderId: string;
      userId: string;
      provider: PaymentProviderName;
      amountArs: number;
      status: "PENDING" | "REQUIRES_ACTION" | "AUTHORIZED";
      idempotencyKey: string;
      providerPaymentId?: string;
      providerPreferenceId?: string;
      metadata?: Record<string, unknown>;
    } = {
      orderId: order.id,
      userId: input.userId,
      provider: input.provider,
      amountArs: order.totalArs,
      status: createdIntent.status,
      idempotencyKey: input.idempotencyKey,
      metadata: createdIntent.raw as Record<string, unknown>,
      ...(createdIntent.externalPaymentId ? { providerPaymentId: createdIntent.externalPaymentId } : {}),
      ...(createdIntent.externalPreferenceId ? { providerPreferenceId: createdIntent.externalPreferenceId } : {}),
    };

    const payment = await this.paymentsRepository.createPayment(paymentInput);

    await createAuditLog({
      actorUserId: input.userId,
      actorRole: "USER",
      action: "payment_intent_created",
      entityType: "payment",
      entityId: payment.id,
      metadata: {
        provider: input.provider,
        orderId: order.id,
      },
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
    query: Record<string, string | string[] | undefined>;
  }) {
    if (env.PAYMENTS_MODE === "MOCK") {
      return { received: true, ignored: true, mode: "MOCK" };
    }

    const provider = createPaymentProvider("MERCADO_PAGO", {
      mercadoPago: {
        accessToken: env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
        webhookSecret: env.MERCADO_PAGO_WEBHOOK_SECRET ?? "",
        frontendBaseUrl: env.API_BASE_URL ?? "https://example.com",
        checkoutMode: env.MERCADO_PAGO_CHECKOUT_MODE,
        successUrl: env.MERCADO_PAGO_SUCCESS_URL,
        failureUrl: env.MERCADO_PAGO_FAILURE_URL,
        pendingUrl: env.MERCADO_PAGO_PENDING_URL,
        notificationUrl: env.MERCADO_PAGO_WEBHOOK_URL,
      },
    });

    const webhook = await provider.webhookHandler({
      rawBody: input.rawBody,
      headers: input.headers,
      query: input.query,
    });

    if (!webhook.externalPaymentId) {
      return { received: true, ignored: true };
    }

    const confirmation = await provider.confirmPayment({
      externalPaymentId: webhook.externalPaymentId,
    });

    const existing = await this.paymentsRepository.findPaymentByProviderExternal("MERCADO_PAGO", webhook.externalPaymentId);

    if (!existing) {
      return { received: true, ignored: true };
    }

    const mappedStatus =
      confirmation.status === "SUCCEEDED"
        ? "SUCCEEDED"
        : confirmation.status === "FAILED"
          ? "FAILED"
          : confirmation.status === "AUTHORIZED"
            ? "AUTHORIZED"
            : "PENDING";

    await this.paymentsRepository.updatePaymentStatusById(existing.id, {
      status: mappedStatus,
      providerPaymentId: webhook.externalPaymentId,
      metadata: confirmation.raw,
    });

    if (mappedStatus === "SUCCEEDED") {
      await this.paymentsRepository.updateOrderStatus(existing.orderId, "CONFIRMED");

      const order = await prisma.order.findUnique({
        where: { id: existing.orderId },
        select: {
          id: true,
          userId: true,
          business: {
            select: {
              ownerUserId: true,
            },
          },
        },
      });

      if (order) {
        await prisma.notification.createMany({
          data: [
            {
              userId: order.userId,
              type: "ORDER_CONFIRMED",
              channel: "PUSH",
              status: "QUEUED",
              title: "Pedido confirmado",
              body: "Tu pack está confirmado. Retirá dentro del horario publicado.",
              payload: {
                orderId: order.id,
              },
            },
            {
              userId: order.business.ownerUserId,
              type: "BUSINESS_NEW_ORDER",
              channel: "PUSH",
              status: "QUEUED",
              title: "Nueva orden",
              body: "Tenés una nueva reserva confirmada en tu local.",
              payload: {
                orderId: order.id,
              },
            },
          ],
        });
      }
    }

    if (mappedStatus === "PENDING") {
      await this.paymentsRepository.updateOrderStatus(existing.orderId, "PENDING_PAYMENT");
    }

    return {
      received: true,
      paymentId: existing.id,
      status: mappedStatus,
    };
  }
}
