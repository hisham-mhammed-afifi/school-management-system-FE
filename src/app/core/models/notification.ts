export type NotificationChannel = 'in_app' | 'sms' | 'email' | 'push';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationRequest {
  userIds: string[];
  title: string;
  body: string;
  channels: NotificationChannel[];
}

export interface ListNotificationsQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  channel?: NotificationChannel;
}

export interface UnreadCountResponse {
  count: number;
}
