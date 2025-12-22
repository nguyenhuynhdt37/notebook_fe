"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, Megaphone, ExternalLink } from "lucide-react";
import { NotificationResponse } from "@/types/user/notification";
import { cn } from "@/lib/utils";
import { markNotificationAsRead } from "@/lib/utils/mark-notification-read";

interface NotificationListProps {
  notifications: NotificationResponse[];
  isLoading?: boolean;
  onNotificationRead?: (id: string) => void;
}

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

export default function NotificationList({
  notifications,
  isLoading,
  onNotificationRead,
}: NotificationListProps) {
  const router = useRouter();
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const handleClick = async (
    e: React.MouseEvent,
    notification: NotificationResponse
  ) => {
    e.preventDefault();

    if (!notification.isRead && !markingIds.has(notification.id)) {
      setMarkingIds((prev) => new Set(prev).add(notification.id));
      try {
        await markNotificationAsRead(notification.id);
        onNotificationRead?.(notification.id);
        if (notification.url) {
          router.push(notification.url);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      } finally {
        setMarkingIds((prev) => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
      }
    } else if (notification.url) {
      router.push(notification.url);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Đang tải thông báo...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Chưa có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={(e) => handleClick(e, notification)}
          className={cn(
            "block p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
            notification.isRead
              ? "border-border/60 bg-background"
              : "border-primary/30 bg-primary/5"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2 rounded-lg shrink-0",
                notification.isRead ? "bg-muted" : "bg-primary/10 text-primary"
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

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTime(notification.createdAt)}
                </span>
                {notification.url && (
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
