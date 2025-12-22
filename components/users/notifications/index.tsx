"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  NotificationsPagedResponse,
  GetNotificationsParams,
} from "@/types/user/notification";
import NotificationFilter from "./notification-filter";
import NotificationList from "./notification-list";
import NotificationPagination from "./notification-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAsRead } from "@/lib/utils/mark-notification-read";
import { useRealtimeNotiStore } from "@/stores/notifications";
import { useUserStore } from "@/stores/user";

export default function Notifications() {
  const user = useUserStore((state) => state.user);
  const markAllRead = useRealtimeNotiStore((state) => state.markAllRead);
  const [data, setData] = useState<NotificationsPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [isRead, setIsRead] = useState<boolean | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [page, isRead, type]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (isRead !== null) {
        params.append("isRead", isRead.toString());
      }

      if (type) {
        params.append("type", type);
      }

      const response = await api.get<NotificationsPagedResponse>(
        `/notifications?${params}`
      );

      setData(response.data);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error("Không thể tải danh sách thông báo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    if (data) {
      setData({
        ...data,
        items: data.items.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        ),
      });
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.role || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      const result = await markAllNotificationsAsRead();
      const role = user.role.toUpperCase();
      markAllRead(role);

      if (data) {
        setData({
          ...data,
          items: data.items.map((item) => ({
            ...item,
            isRead: true,
          })),
          meta: {
            ...data.meta,
            total: data.meta.total,
          },
        });
      }

      toast.success(`Đã đánh dấu ${result.updatedCount} thông báo là đã đọc`);
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        toast.error("Không thể đánh dấu tất cả thông báo");
      }
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = data?.items.filter((item) => !item.isRead).length || 0;

  const handleIsReadChange = (value: boolean | null) => {
    setIsRead(value);
    setPage(0);
  };

  const handleTypeChange = (value: string | null) => {
    setType(value);
    setPage(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Bell className="size-5 text-foreground" />
              </div>
              <div>
                <CardTitle>Thông báo</CardTitle>
                {data && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.meta.total} thông báo
                    {unreadCount > 0 && ` • ${unreadCount} chưa đọc`}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="h-8 text-xs"
              >
                <CheckCheck className="size-3.5 mr-1.5" />
                {isMarkingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <NotificationFilter
            isRead={isRead}
            type={type}
            onIsReadChange={handleIsReadChange}
            onTypeChange={handleTypeChange}
          />

          {isLoading && !data ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              <NotificationList
                notifications={data?.items || []}
                isLoading={isLoading}
                onNotificationRead={handleNotificationRead}
              />

              {data && data.meta.totalPages > 1 && (
                <NotificationPagination
                  meta={data.meta}
                  page={page}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
