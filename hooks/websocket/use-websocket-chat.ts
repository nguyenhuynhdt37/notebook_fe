"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { connectWebSocket } from "./connectWebSocket";
import api from "@/api/client/axios";
import { useUserStore } from "@/stores/user";
import type {
  Message,
  SendMessageRequest,
  ReactRequest,
  ReactionUpdate,
  TypingNotification,
  OnlineStatus,
  ChatHistoryResponse,
} from "@/types/chat/message";

interface UseWebSocketChatOptions {
  notebookId: string;
  accessToken?: string;
  onError?: (error: Error) => void;
}

export function useWebSocketChat({
  notebookId,
  accessToken,
  onError,
}: UseWebSocketChatOptions) {
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<
    Map<string, TypingNotification>
  >(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(
    new Map()
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const loadHistory = useCallback(
    async (page: number = 0) => {
      try {
        const response = await api.get<ChatHistoryResponse>(
          `/api/notebooks/${notebookId}/chat/history`,
          {
            params: { page, size: 50 },
          }
        );

        const data = response.data;
        let messages: Message[] = [];

        if (Array.isArray(data)) {
          messages = data;
        } else if (data?.content && Array.isArray(data.content)) {
          messages = data.content;
        } else {
          setMessages([]);
          setHasMore(false);
          return;
        }

        if (page === 0) {
          setMessages([...messages].reverse());
        } else {
          setMessages((prev) => [...messages].reverse().concat(prev));
        }

        setHasMore(Array.isArray(data) ? false : data?.last === false);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error loading chat history:", error);
        onErrorRef.current?.(new Error("Không thể tải lịch sử chat"));
      } finally {
        setIsLoading(false);
      }
    },
    [notebookId]
  );

  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data = JSON.parse(message.body);

      if (data.id && data.content) {
        setMessages((prev) => [...prev, data as Message]);
      } else if (data.messageId && data.reaction) {
        const reactionUpdate = data as ReactionUpdate;
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== reactionUpdate.messageId) return msg;

            const existingIndex = msg.reactions.findIndex(
              (r) =>
                r.id === reactionUpdate.reaction?.id ||
                (r.emoji === reactionUpdate.reaction?.emoji &&
                  r.user.id === reactionUpdate.reaction?.user.id)
            );

            if (reactionUpdate.action === "added") {
              if (existingIndex === -1 && reactionUpdate.reaction) {
                return {
                  ...msg,
                  reactions: [...msg.reactions, reactionUpdate.reaction],
                };
              }
            } else if (existingIndex !== -1) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  (_, idx) => idx !== existingIndex
                ),
              };
            }

            return msg;
          })
        );
      } else if (data.userId && typeof data.isTyping === "boolean") {
        const typing = data as TypingNotification;
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          if (typing.isTyping) {
            newMap.set(typing.userId, typing);
          } else {
            newMap.delete(typing.userId);
          }
          return newMap;
        });
      } else if (data.userId && typeof data.isOnline === "boolean") {
        const status = data as OnlineStatus;
        setOnlineUsers((prev) => {
          const newMap = new Map(prev);
          if (status.isOnline) {
            newMap.set(status.userId, status);
          } else {
            newMap.delete(status.userId);
          }
          return newMap;
        });
      } else if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].userId &&
        typeof data[0].isOnline === "boolean"
      ) {
        const statuses = data as OnlineStatus[];
        setOnlineUsers((prev) => {
          const newMap = new Map();
          statuses.forEach((status) => {
            if (status.isOnline) {
              newMap.set(status.userId, status);
            }
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || clientRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;

    if (!accessToken) {
      isConnectingRef.current = false;
      onErrorRef.current?.(
        new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
      );
      return;
    }

    try {
      const client = await connectWebSocket(
        "/ws",
        accessToken,
        user?.role || null,
        undefined,
        () => {
          setIsConnected(false);
        }
      );

      clientRef.current = client;

      if (user) {
        const currentUserStatus: OnlineStatus = {
          userId: user.id.toString(),
          user: {
            id: user.id.toString(),
            fullName: user.fullName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          isOnline: true,
        };
        setOnlineUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentUserStatus.userId, currentUserStatus);
          return newMap;
        });
      }

      const subscription = client.subscribe(
        `/topic/notebooks/${notebookId}/chat`,
        handleMessage
      );
      subscriptionRef.current = subscription;

      setIsConnected(true);
      isConnectingRef.current = false;
    } catch (error) {
      isConnectingRef.current = false;
      setIsConnected(false);
      onErrorRef.current?.(
        error instanceof Error ? error : new Error("Lỗi kết nối WebSocket")
      );
    }
  }, [notebookId, accessToken, user, handleMessage]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (clientRef.current?.connected) {
      clientRef.current.deactivate();
    }
    clientRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(
    (content: string, replyToMessageId?: string | null) => {
      const client = clientRef.current;
      if (!client?.connected) {
        onError?.(new Error("WebSocket chưa kết nối"));
        return;
      }

      const request: SendMessageRequest = {
        content,
        replyToMessageId: replyToMessageId || null,
      };

      client.publish({
        destination: `/app/notebooks/${notebookId}/chat.send`,
        body: JSON.stringify(request),
      });
    },
    [notebookId, onError]
  );

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      const client = clientRef.current;
      if (!client?.connected) {
        onError?.(new Error("WebSocket chưa kết nối"));
        return;
      }

      const request: ReactRequest = { messageId, emoji };
      client.publish({
        destination: `/app/notebooks/${notebookId}/chat.react`,
        body: JSON.stringify(request),
      });
    },
    [notebookId, onError]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const client = clientRef.current;
      if (!client?.connected) return;

      client.publish({
        destination: `/app/notebooks/${notebookId}/chat.typing`,
        body: JSON.stringify({ isTyping }),
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(false);
        }, 3000);
      }
    },
    [notebookId]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    loadHistory(currentPage + 1);
  }, [hasMore, isLoading, currentPage, loadHistory]);

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    loadHistory(0);
  }, [notebookId, loadHistory]);

  useEffect(() => {
    if (!accessToken) return;

    disconnect();
    connect();
    return () => {
      disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, accessToken]);

  return {
    messages,
    isConnected,
    isLoading,
    typingUsers: Array.from(typingUsers.values()),
    onlineUsers: Array.from(onlineUsers.values()),
    hasMore,
    sendMessage,
    reactToMessage,
    sendTyping,
    loadMore,
  };
}
