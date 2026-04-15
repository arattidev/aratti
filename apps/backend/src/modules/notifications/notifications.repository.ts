import { prisma } from "@aratti/db";

export class NotificationsRepository {
  async createNotification(input: {
    userId: string;
    type:
      | "ORDER_CONFIRMED"
      | "PICKUP_REMINDER"
      | "FAVORITE_NEW_OFFER"
      | "BUSINESS_NEW_ORDER"
      | "PAYOUT_SENT"
      | "ADMIN_ALERT";
    title: string;
    body: string;
    payload?: Record<string, unknown>;
  }) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        channel: "PUSH",
        status: "QUEUED",
        title: input.title,
        body: input.body,
        payload: input.payload,
      },
    });
  }

  async listUserNotifications(userId: string, limit: number) {
    return prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }
}
