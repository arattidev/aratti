import { prisma } from "@aratti/db";

export class AdminRepository {
  async listPendingBusinesses() {
    return prisma.business.findMany({
      where: {
        verificationStatus: "PENDING_VERIFICATION",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
    });
  }

  async findRefundById(refundId: string) {
    return prisma.refund.findFirst({
      where: {
        id: refundId,
        deletedAt: null,
      },
      include: {
        payment: true,
      },
    });
  }

  async approveRefund(refundId: string) {
    return prisma.refund.update({
      where: {
        id: refundId,
      },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
      },
    });
  }

  async updateOrderAsRefunded(orderId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REFUNDED",
      },
    });
  }

  async listFraudFlags() {
    return prisma.auditLog.findMany({
      where: {
        riskScore: {
          gte: 50,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }
}
