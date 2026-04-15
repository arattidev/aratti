import { ConsoleNotificationService } from "@aratti/notifications";

import { NotificationsRepository } from "./notifications.repository";

const pushService = new ConsoleNotificationService();

export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async listNotifications(userId: string) {
    const notifications = await this.notificationsRepository.listUserNotifications(userId, 50);

    return {
      data: notifications.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async pushOrderConfirmed(userId: string, orderId: string) {
    const notification = await this.notificationsRepository.createNotification({
      userId,
      type: "ORDER_CONFIRMED",
      title: "Pedido confirmado",
      body: "Tu reserva está lista. Mostrá el QR en el local al retirar.",
      payload: { orderId },
    });

    await pushService.sendPush({
      userId,
      title: notification.title,
      body: notification.body,
      data: {
        notificationId: notification.id,
      },
    });

    return {
      notificationId: notification.id,
    };
  }
}
