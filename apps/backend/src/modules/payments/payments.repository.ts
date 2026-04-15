import { prisma } from "@aratti/db";
import type { PaymentProvider } from "@aratti/types";

export class PaymentsRepository {
  async findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });
  }

  async findPaymentByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findUnique({
      where: {
        idempotencyKey,
      },
    });
  }

  async findPaymentByProviderExternal(provider: PaymentProvider, externalPaymentId: string) {
    return prisma.payment.findFirst({
      where: {
        provider,
        providerPaymentId: externalPaymentId,
        deletedAt: null,
      },
    });
  }

  async createPayment(input: {
    orderId: string;
    userId: string;
    provider: PaymentProvider;
    amountArs: number;
    status: "PENDING" | "REQUIRES_ACTION" | "AUTHORIZED";
    idempotencyKey: string;
    providerPaymentId?: string;
    providerPreferenceId?: string;
    paymentMethod?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.payment.create({
      data: {
        orderId: input.orderId,
        userId: input.userId,
        provider: input.provider,
        amountArs: input.amountArs,
        currencyCode: "ARS",
        status: input.status,
        idempotencyKey: input.idempotencyKey,
        providerPaymentId: input.providerPaymentId,
        providerPreferenceId: input.providerPreferenceId,
        paymentMethod: input.paymentMethod,
        metadata: input.metadata,
      },
    });
  }

  async updatePaymentStatusById(paymentId: string, input: { status: string; providerPaymentId?: string; metadata?: unknown }) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: input.status as never,
        providerPaymentId: input.providerPaymentId,
        metadata: input.metadata as never,
        lastWebhookAt: new Date(),
        capturedAt: input.status === "SUCCEEDED" ? new Date() : undefined,
        refundedAt: input.status === "REFUNDED" ? new Date() : undefined,
        failedAt: input.status === "FAILED" ? new Date() : undefined,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: "CONFIRMED" | "REFUNDED" | "PENDING_PAYMENT") {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
      },
    });
  }
}
