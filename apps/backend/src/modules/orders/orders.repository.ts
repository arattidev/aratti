import { prisma } from "@aratti/db";

export class OrdersRepository {
  async findOfferForOrder(offerId: string) {
    return prisma.offer.findFirst({
      where: {
        id: offerId,
        deletedAt: null,
      },
      include: {
        business: true,
      },
    });
  }

  async createPendingOrder(input: {
    userId: string;
    offerId: string;
    quantity: number;
    unitPriceArs: number;
    subtotalArs: number;
    serviceFeeArs: number;
    totalArs: number;
    businessId: string;
    pickupQrTokenHash: string;
    pickupCode: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const decremented = await tx.offer.updateMany({
        where: {
          id: input.offerId,
          status: "ACTIVE",
          quantityAvailable: {
            gte: input.quantity,
          },
          deletedAt: null,
        },
        data: {
          quantityAvailable: {
            decrement: input.quantity,
          },
        },
      });

      if (decremented.count !== 1) {
        throw new Error("offer_stock_conflict");
      }

      return tx.order.create({
        data: {
          orderNumber: buildOrderNumber(),
          userId: input.userId,
          businessId: input.businessId,
          offerId: input.offerId,
          quantity: input.quantity,
          unitPriceArs: input.unitPriceArs,
          subtotalArs: input.subtotalArs,
          serviceFeeArs: input.serviceFeeArs,
          totalArs: input.totalArs,
          pickupQrTokenHash: input.pickupQrTokenHash,
          pickupCode: input.pickupCode,
          status: "PENDING_PAYMENT",
          currencyCode: "ARS",
        },
      });
    });
  }

  async findOrderById(orderId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
      },
      include: {
        offer: true,
        business: true,
      },
    });
  }

  async markOrderPickedUp(orderId: string) {
    return prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "PICKED_UP",
        pickedUpAt: new Date(),
      },
    });
  }

  async listUserOrders(input: {
    userId: string;
    statusFilter?: "active" | "past" | "cancelled";
    limit: number;
  }) {
    const statusMap: Record<string, string[]> = {
      active: ["PENDING_PAYMENT", "CONFIRMED"],
      past: ["PICKED_UP", "NO_SHOW", "REFUNDED"],
      cancelled: ["CANCELLED", "PAYMENT_EXPIRED"],
    };

    return prisma.order.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        status: input.statusFilter ? { in: statusMap[input.statusFilter] as never[] } : undefined,
      },
      include: {
        offer: true,
        business: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: input.limit,
    });
  }
}

function buildOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AR-${timestamp}-${random}`;
}
