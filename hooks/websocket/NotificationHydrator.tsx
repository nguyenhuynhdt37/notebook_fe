"use client";

import { useRealtimeNotiStore } from "@/stores/notifications";
import { useUserStore } from "@/stores/user";
import { NotificationsPagedResponse } from "@/types/user/notification";
import { useEffect, useRef } from "react";

export function InitRealtimeNoti({
  role,
  notifications,
}: {
  role: string;
  notifications: NotificationsPagedResponse | undefined | null;
}) {
  console.log("notifications InitRealtimeNoti", notifications);
  const { init, hydrate } = useRealtimeNotiStore((s) => s);
  const user = useUserStore((s) => s.user ?? null);
  const hasInited = useRef(false);

  // Init bucket trước, chỉ 1 lần
  useEffect(() => {
    if (role && user?.id && !hasInited.current) {
      init(role, user.id.toString());
      hasInited.current = true;
    }
  }, [role, user?.id, init]);

  // Hydrate data sau khi đã init
  useEffect(() => {
    if (
      role &&
      notifications &&
      Array.isArray(notifications.items) &&
      hasInited.current
    ) {
      const unreadCount = notifications.items.filter(
        (item) => !item.isRead
      ).length;
      console.log("Hydrating notifications:", {
        role,
        itemsCount: notifications.items.length,
        unread: unreadCount,
      });
      hydrate(role, notifications.items, unreadCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, notifications, hasInited.current]);

  return null;
}
