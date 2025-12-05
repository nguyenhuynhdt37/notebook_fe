"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRealtimeNotiStore } from "@/stores/notifications";
import { Notification } from "@/types/user/notification";
import { Bell, MessageSquare, Megaphone } from "lucide-react";

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

export default function NotificationToast() {
  const router = useRouter();
  const activeRole = useRealtimeNotiStore((state) => state.activeRole);
  const buckets = useRealtimeNotiStore((state) => state.buckets);
  const previousTop10Ref = useRef<Map<string, Notification[]>>(new Map());

  useEffect(() => {
    if (!activeRole) return;

    const bucket = buckets[activeRole];
    if (!bucket) return;

    const previousTop10 = previousTop10Ref.current.get(activeRole) || [];
    const currentTop10 = bucket.top10;

    if (previousTop10.length === 0 && currentTop10.length > 0) {
      previousTop10Ref.current.set(activeRole, currentTop10);
      return;
    }

    const newNotifications = currentTop10.filter(
      (noti) => !previousTop10.some((prev) => prev.id === noti.id)
    );

    newNotifications.forEach((notification) => {
      toast(notification.title, {
        description: notification.content,
        icon: getNotificationIcon(notification.type),
        action: notification.url
          ? {
              label: "Xem",
              onClick: () => {
                router.push(notification.url);
              },
            }
          : undefined,
        duration: 5000,
      });
    });

    previousTop10Ref.current.set(activeRole, currentTop10);
  }, [activeRole, buckets, router]);

  return null;
}
