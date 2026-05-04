import { prisma, type Prisma } from "@aratti/db";
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
    status: "PENDING" | "REQUIRES_ACTION" | "AUTHORIZED" | "SUCCEEDED";
    idempotencyKey: string;
    providerPaymentId?: string;
    providerPreferenceId?: string;
    paymentMethod?: string;
    metadata?: Record<string, unknown>;
  }) {
    const data: Prisma.PaymentUncheckedCreateInput = {
      orderId: input.orderId,
      userId: input.userId,
      provider: input.provider,
      amountArs: input.amountArs,
      currencyCode: "ARS",
      status: input.status,
      idempotencyKey: input.idempotencyKey,
      providerPaymentId: input.providerPaymentId ?? null,
      providerPreferenceId: input.providerPreferenceId ?? null,
      paymentMethod: input.paymentMethod ?? null,
    };

    if (input.metadata !== undefined) {
      data.metadata = input.metadata as Prisma.InputJsonValue;
    }

    return prisma.payment.create({
      data,
    });
  }

  async updatePaymentStatusById(paymentId: string, input: { status: string; providerPaymentId?: string; metadata?: unknown }) {
    const data: Prisma.PaymentUpdateInput = {
      status: input.status as never,
      lastWebhookAt: new Date(),
      ...(input.providerPaymentId !== undefined ? { providerPaymentId: input.providerPaymentId } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      ...(input.status === "SUCCEEDED" ? { capturedAt: new Date() } : {}),
      ...(input.status === "REFUNDED" ? { refundedAt: new Date() } : {}),
      ...(input.status === "FAILED" ? { failedAt: new Date() } : {}),
    };

    return prisma.payment.update({
      where: { id: paymentId },
      data,
    });
  }

  async updateOrderStatus(orderId: string, status: "CONFIRMED" | "REFUNDED" | "PENDING_PAYMENT") {
    const data: Prisma.OrderUpdateInput = {
      status,
      ...(status === "CONFIRMED" ? { confirmedAt: new Date() } : {}),
    };

    return prisma.order.update({
      where: { id: orderId },
      data,
    });
  }
}
