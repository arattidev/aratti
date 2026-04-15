export interface NotificationMessage {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationService {
  sendPush(message: NotificationMessage): Promise<void>;
}

export class ConsoleNotificationService implements NotificationService {
  async sendPush(message: NotificationMessage): Promise<void> {
    console.info("[notification:push]", message);
  }
}
