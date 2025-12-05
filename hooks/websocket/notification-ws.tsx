"use client";

import { Client, StompSubscription } from "@stomp/stompjs";
import { connectWebSocket } from "@/hooks/websocket/connectWebSocket";
import { useRealtimeNotiStore } from "@/stores/notifications";
import { useUserStore } from "@/stores/user";
import { Notification } from "@/types/user/notification";
import { useEffect, useLayoutEffect, useRef } from "react";

interface NotificationWSProps {
  accessToken: string | null;
  role_name: string;
}

export function NotificationWS({
  accessToken,
  role_name,
}: NotificationWSProps) {
  const userId = useUserStore((s) => s.user?.id ?? null);
  const add = useRealtimeNotiStore((s) => s.add);
  const updateUnreadCount = useRealtimeNotiStore((s) => s.updateUnreadCount);

  const wsRef = useRef<Client | null>(null);
  const notificationSubRef = useRef<StompSubscription | null>(null);
  const countSubRef = useRef<StompSubscription | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = useRef(0);
  const isClosing = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount - useLayoutEffect để cleanup đồng bộ trước khi React cleanup
  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      isClosing.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      if (notificationSubRef.current) {
        try {
          notificationSubRef.current.unsubscribe();
        } catch {}
        notificationSubRef.current = null;
      }

      if (countSubRef.current) {
        try {
          countSubRef.current.unsubscribe();
        } catch {}
        countSubRef.current = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.deactivate();
        } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // ❌ Không có user hoặc token → đóng WS
    if (!userId || !accessToken) {
      isClosing.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      if (notificationSubRef.current) {
        try {
          notificationSubRef.current.unsubscribe();
        } catch {}
        notificationSubRef.current = null;
      }

      if (countSubRef.current) {
        try {
          countSubRef.current.unsubscribe();
        } catch {}
        countSubRef.current = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.deactivate();
        } catch {}
        wsRef.current = null;
      }

      return;
    }

    isClosing.current = false;
    attempts.current = 0;

    const endpoint = `/ws`;

    const connect = async () => {
      if (wsRef.current || !mountedRef.current || isClosing.current) return;

      try {
        const client = await connectWebSocket(
          endpoint,
          accessToken,
          role_name,
          undefined,
          () => {
            wsRef.current = null;
            notificationSubRef.current = null;
            countSubRef.current = null;
            if (isClosing.current || !mountedRef.current) return;

            const timeout = Math.min(1000 * 2 ** attempts.current, 12000);
            attempts.current++;

            reconnectTimer.current = setTimeout(() => {
              if (mountedRef.current && !isClosing.current) {
                connect();
              }
            }, timeout);
          }
        );

        // Subscribe vào notifications topic
        const notificationSub = client.subscribe(
          `/topic/user/${userId}/notifications`,
          (message) => {
            if (!mountedRef.current || isClosing.current) return;
            try {
              const notification: Notification = JSON.parse(message.body);
              console.log("New notification:", notification);
              add(role_name, notification);
            } catch (error) {
              console.error("Error parsing notification message:", error);
            }
          }
        );

        // Subscribe vào unread count topic
        const countSub = client.subscribe(
          `/topic/user/${userId}/notifications/count`,
          (message) => {
            if (!mountedRef.current || isClosing.current) return;
            try {
              const count = parseInt(message.body, 10);
              console.log("Unread count updated:", count);
              updateUnreadCount(role_name, count);
            } catch (error) {
              console.error("Error parsing unread count:", error);
            }
          }
        );

        if (!mountedRef.current || isClosing.current) {
          try {
            notificationSub.unsubscribe();
            countSub.unsubscribe();
            client.deactivate();
          } catch {}
          return;
        }

        wsRef.current = client;
        notificationSubRef.current = notificationSub;
        countSubRef.current = countSub;
        attempts.current = 0;
      } catch (err) {
        if (isClosing.current || !mountedRef.current) return;

        const timeout = Math.min(1000 * 2 ** attempts.current, 12000);
        attempts.current++;

        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current && !isClosing.current) {
            connect();
          }
        }, timeout);
      }
    };

    connect();

    return () => {
      isClosing.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      if (notificationSubRef.current) {
        try {
          notificationSubRef.current.unsubscribe();
        } catch {}
        notificationSubRef.current = null;
      }

      if (countSubRef.current) {
        try {
          countSubRef.current.unsubscribe();
        } catch {}
        countSubRef.current = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.deactivate();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [userId, accessToken, role_name, add, updateUnreadCount]);

  return null;
}
