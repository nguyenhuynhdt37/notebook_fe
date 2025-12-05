export interface NotificationResponse {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  type: string;
  title: string;
  content: string;
  url: string;
  metadata: Record<string, any>;
  isRead: boolean;
  readAt: string | null;
  action: string | null;
  roleTarget: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export type Notification = NotificationResponse;

export interface NotificationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface NotificationsPagedResponse {
  items: NotificationResponse[];
  meta: NotificationMeta;
}

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  isRead?: boolean | null;
  type?: string | null;
}
