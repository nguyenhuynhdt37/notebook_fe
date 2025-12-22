"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Megaphone, CheckCheck } from "lucide-react";
import { useRealtimeNotiStore } from "@/stores/notifications";
import { useUserStore } from "@/stores/user";
import { Notification } from "@/types/user/notification";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/utils/mark-notification-read";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "chat_message":
      return <MessageSquare className="size-4" />;
    case "announcement":
      return <Megaphone className="size-4" />;
    default:
      return <Bell className="size-4" />;
  }
};

const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function NotificationDropdown() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const init = useRealtimeNotiStore((state) => state.init);
  const markAsRead = useRealtimeNotiStore((state) => state.markAsRead);
  const markAllRead = useRealtimeNotiStore((state) => state.markAllRead);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const role = user?.role?.toUpperCase() || null;
  const bucket = useRealtimeNotiStore((state) =>
    role ? state.buckets[role] : null
  );

  useEffect(() => {
    if (user?.id && user?.role) {
      const roleKey = user.role.toUpperCase();
      init(roleKey, user.id.toString());
    }
  }, [user?.id, user?.role, init]);

  if (!user || !user.role || !role || !bucket) return null;

  const notifications = bucket.top10;
  const unreadCount = bucket.unread;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        if (role) {
          markAsRead(role, notification.id);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const handleMarkAllRead = async () => {
    if (!role || unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (role) {
        markAllRead(role);
      }
      toast.success(
        `Đã đánh dấu ${result.updatedCount} thông báo là đã đọc`
      );
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="h-7 text-xs"
            >
              <CheckCheck className="size-3.5 mr-1.5" />
              {isMarkingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </Button>
          )}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Bell className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Chưa có thông báo nào
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0",
                        notification.isRead
                          ? "bg-muted"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={cn(
                            "font-semibold text-sm",
                            notification.isRead
                              ? "text-foreground"
                              : "text-foreground font-bold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.content}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              asChild
            >
              <Link href="/notifications">Xem tất cả thông báo</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

