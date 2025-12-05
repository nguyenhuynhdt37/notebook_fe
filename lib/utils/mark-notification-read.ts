import api from "@/api/client/axios";
import { Notification } from "@/types/user/notification";

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const response = await api.patch<Notification>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
}

export interface MarkAllAsReadResponse {
  updatedCount: number;
  unreadCount: number;
  message: string;
}

export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  const response = await api.patch<MarkAllAsReadResponse>(
    `/notifications/read-all`
  );
  return response.data;
}

