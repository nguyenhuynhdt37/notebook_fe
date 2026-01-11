"use client";

import { useCallback, useEffect, useRef } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import { connectWebSocket } from "@/hooks/websocket/connectWebSocket";
import { useUserStore } from "@/stores/user";
import {
  AiTaskProgressMessage,
  AiTaskNotification,
} from "@/types/user/ai-task";
import { toast } from "sonner";

interface UseAiTaskWebSocketOptions {
  notebookId: string;
  accessToken: string | null;
  role_name?: string | null;
  onTaskProgress?: (message: AiTaskProgressMessage) => void;
  onTaskNotification?: (message: AiTaskNotification) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook để quản lý WebSocket connection cho AI Task Progress
 * 
 * Subscribe vào 2 channels:
 * 1. `/topic/ai-task/{aiSetId}` - Task Owner Channel (progress chi tiết)
 * 2. `/topic/notebook/{notebookId}/ai-tasks` - Notebook Channel (notify members)
 */
export function useAiTaskWebSocket({
  notebookId,
  accessToken,
  role_name,
  onTaskProgress,
  onTaskNotification,
  onError,
}: UseAiTaskWebSocketOptions) {
  const user = useUserStore((s) => s.user);
  const wsRef = useRef<Client | null>(null);
  const notebookSubRef = useRef<StompSubscription | null>(null);
  const taskSubscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempts = useRef(0);
  const isClosing = useRef(false);
  const mountedRef = useRef(true);

  const onTaskProgressRef = useRef(onTaskProgress);
  const onTaskNotificationRef = useRef(onTaskNotification);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onTaskProgressRef.current = onTaskProgress;
    onTaskNotificationRef.current = onTaskNotification;
    onErrorRef.current = onError;
  }, [onTaskProgress, onTaskNotification, onError]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      isClosing.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      // Unsubscribe all task subscriptions
      taskSubscriptionsRef.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {}
      });
      taskSubscriptionsRef.current.clear();

      if (notebookSubRef.current) {
        try {
          notebookSubRef.current.unsubscribe();
        } catch {}
        notebookSubRef.current = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.deactivate();
        } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  // Subscribe to a specific task progress channel
  const subscribeToTask = useCallback(
    (aiSetId: string) => {
      if (!wsRef.current?.connected || !aiSetId) {
        return () => {};
      }

      // Already subscribed
      if (taskSubscriptionsRef.current.has(aiSetId)) {
        return () => {
          const sub = taskSubscriptionsRef.current.get(aiSetId);
          if (sub) {
            try {
              sub.unsubscribe();
            } catch {}
            taskSubscriptionsRef.current.delete(aiSetId);
          }
        };
      }

      const subscription = wsRef.current.subscribe(
        `/topic/ai-task/${aiSetId}`,
        (message) => {
          if (!mountedRef.current || isClosing.current) return;
          try {
            const data: AiTaskProgressMessage = JSON.parse(message.body);
            console.log("AI Task Progress:", data);
            onTaskProgressRef.current?.(data);
          } catch (error) {
            console.error("Error parsing task progress message:", error);
          }
        }
      );

      taskSubscriptionsRef.current.set(aiSetId, subscription);

      return () => {
        try {
          subscription.unsubscribe();
        } catch {}
        taskSubscriptionsRef.current.delete(aiSetId);
      };
    },
    []
  );

  // Unsubscribe from a specific task
  const unsubscribeFromTask = useCallback((aiSetId: string) => {
    const subscription = taskSubscriptionsRef.current.get(aiSetId);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch {}
      taskSubscriptionsRef.current.delete(aiSetId);
    }
  }, []);

  // Main connection effect
  useEffect(() => {
    if (!notebookId || !accessToken) {
      isClosing.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      if (notebookSubRef.current) {
        try {
          notebookSubRef.current.unsubscribe();
        } catch {}
        notebookSubRef.current = null;
      }

      taskSubscriptionsRef.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {}
      });
      taskSubscriptionsRef.current.clear();

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
          role_name || user?.role || null,
          undefined,
          () => {
            wsRef.current = null;
            notebookSubRef.current = null;
            taskSubscriptionsRef.current.forEach((sub) => {
              try {
                sub.unsubscribe();
              } catch {}
            });
            taskSubscriptionsRef.current.clear();

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

        // Subscribe to notebook channel for notifications
        const notebookSub = client.subscribe(
          `/topic/notebook/${notebookId}/ai-tasks`,
          (message) => {
            if (!mountedRef.current || isClosing.current) return;
            try {
              const data: AiTaskNotification = JSON.parse(message.body);
              console.log("AI Task Notification:", data);
              onTaskNotificationRef.current?.(data);
            } catch (error) {
              console.error("Error parsing task notification:", error);
            }
          }
        );

        if (!mountedRef.current || isClosing.current) {
          try {
            notebookSub.unsubscribe();
            client.deactivate();
          } catch {}
          return;
        }

        wsRef.current = client;
        notebookSubRef.current = notebookSub;
        attempts.current = 0;
      } catch (err) {
        if (isClosing.current || !mountedRef.current) return;

        const error =
          err instanceof Error ? err : new Error("Lỗi kết nối WebSocket");
        onErrorRef.current?.(error);

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

      taskSubscriptionsRef.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {}
      });
      taskSubscriptionsRef.current.clear();

      if (notebookSubRef.current) {
        try {
          notebookSubRef.current.unsubscribe();
        } catch {}
        notebookSubRef.current = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.deactivate();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [notebookId, accessToken, role_name, user?.role]);

  return {
    subscribeToTask,
    unsubscribeFromTask,
    isConnected: wsRef.current?.connected ?? false,
  };
}

