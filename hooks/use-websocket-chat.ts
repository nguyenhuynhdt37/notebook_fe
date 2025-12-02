"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getWebSocketService } from "@/lib/services/websocket";
import { getCookie } from "@/lib/utils/cookie";
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
    onError?: (error: Error) => void;
}

export function useWebSocketChat({ notebookId, onError }: UseWebSocketChatOptions) {
    const user = useUserStore((state) => state.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const historyLoadedRef = useRef<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingNotification>>(
        new Map()
    );
    const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineStatus>>(
        new Map()
    );
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const wsServiceRef = useRef(getWebSocketService());
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);
    const onErrorRef = useRef(onError);
    const loadHistoryRef = useRef<((page: number) => Promise<void>) | null>(null);

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
                console.log("Chat history response:", data);

                let messages: Message[] = [];

                if (Array.isArray(data)) {
                    messages = data;
                } else if (data?.content && Array.isArray(data.content)) {
                    messages = data.content;
                } else {
                    console.error("Invalid messages format:", data);
                    setMessages([]);
                    setHasMore(false);
                    return;
                }

                if (page === 0) {
                    setMessages([...messages].reverse());
                } else {
                    setMessages((prev) => [...messages].reverse().concat(prev));
                }

                if (Array.isArray(data)) {
                    setHasMore(false);
                } else {
                    setHasMore(data?.last === false);
                }

                setCurrentPage(page);
                historyLoadedRef.current = notebookId;
            } catch (error) {
                console.error("Error loading chat history:", error);
                onErrorRef.current?.(new Error("Không thể tải lịch sử chat"));
            } finally {
                setIsLoading(false);
            }
        },
        [notebookId, onError]
    );

    useEffect(() => {
        loadHistoryRef.current = loadHistory;
    }, [loadHistory]);

    useEffect(() => {
        setIsLoading(true);
        setMessages([]);
        historyLoadedRef.current = null;

        const load = async () => {
            try {
                const response = await api.get<ChatHistoryResponse>(
                    `/api/notebooks/${notebookId}/chat/history`,
                    {
                        params: { page: 0, size: 50 },
                    }
                );

                const data = response.data;
                console.log("Chat history response:", data);

                let messages: Message[] = [];

                if (Array.isArray(data)) {
                    messages = data;
                } else if (data?.content && Array.isArray(data.content)) {
                    messages = data.content;
                } else {
                    console.error("Invalid messages format:", data);
                    setMessages([]);
                    setHasMore(false);
                    setIsLoading(false);
                    return;
                }

                console.log("Setting messages:", messages.length, "messages");
                const reversedMessages = [...messages].reverse();
                console.log("Reversed messages:", reversedMessages);
                setMessages(reversedMessages);

                if (Array.isArray(data)) {
                    setHasMore(false);
                } else {
                    setHasMore(data?.last === false);
                }

                setCurrentPage(0);
                historyLoadedRef.current = notebookId;
            } catch (error) {
                console.error("Error loading chat history:", error);
                onErrorRef.current?.(new Error("Không thể tải lịch sử chat"));
            } finally {
                setIsLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebookId]);

    const connect = useCallback(async () => {
        if (isConnectingRef.current || wsServiceRef.current.isConnected()) {
            return;
        }

        isConnectingRef.current = true;

        let token = getCookie("AUTH-TOKEN");

        if (!token) {
            try {
                const response = await fetch("/api/auth/token", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    token = data.token;
                }
            } catch (error) {
                console.error("Error fetching token:", error);
            }
        }

        if (!token) {
            isConnectingRef.current = false;
            onErrorRef.current?.(new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại."));
            return;
        }

        const wsService = wsServiceRef.current;

        wsService.connect({
            token,
            onConnect: () => {
                isConnectingRef.current = false;
                setIsConnected(true);

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
                        console.log("Added current user to online list:", Array.from(newMap.values()));
                        return newMap;
                    });
                }

                const unsubscribe = wsService.subscribe(
                    `/topic/notebooks/${notebookId}/chat`,
                    (message) => {
                        console.log("WebSocket message received:", message.body);
                        try {
                            const data = JSON.parse(message.body);

                            if (data.id && data.content) {
                                setMessages((prev) => [...prev, data as Message]);
                            } else if (data.messageId && data.reaction) {
                                const reactionUpdate = data as ReactionUpdate;
                                setMessages((prev) =>
                                    prev.map((msg) => {
                                        if (msg.id !== reactionUpdate.messageId) return msg;

                                        const existingReactionIndex = msg.reactions.findIndex(
                                            (r) =>
                                                r.id === reactionUpdate.reaction?.id ||
                                                (r.emoji === reactionUpdate.reaction?.emoji &&
                                                    r.user.id === reactionUpdate.reaction?.user.id)
                                        );

                                        if (reactionUpdate.action === "added") {
                                            if (existingReactionIndex === -1 && reactionUpdate.reaction) {
                                                return {
                                                    ...msg,
                                                    reactions: [...msg.reactions, reactionUpdate.reaction],
                                                };
                                            }
                                        } else {
                                            if (existingReactionIndex !== -1) {
                                                return {
                                                    ...msg,
                                                    reactions: msg.reactions.filter(
                                                        (_, idx) => idx !== existingReactionIndex
                                                    ),
                                                };
                                            }
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
                                console.log("Online status update:", status);
                                setOnlineUsers((prev) => {
                                    const newMap = new Map(prev);
                                    if (status.isOnline) {
                                        newMap.set(status.userId, status);
                                    } else {
                                        newMap.delete(status.userId);
                                    }
                                    console.log("Online users after update:", Array.from(newMap.values()));
                                    return newMap;
                                });
                            } else if (Array.isArray(data) && data.length > 0 && data[0].userId && typeof data[0].isOnline === "boolean") {
                                const statuses = data as OnlineStatus[];
                                console.log("Online statuses list:", statuses);
                                setOnlineUsers((prev) => {
                                    const newMap = new Map();
                                    statuses.forEach((status) => {
                                        if (status.isOnline) {
                                            newMap.set(status.userId, status);
                                        }
                                    });
                                    console.log("Online users after list update:", Array.from(newMap.values()));
                                    return newMap;
                                });
                            }
                        } catch (error) {
                            console.error("Error parsing WebSocket message:", error);
                        }
                    }
                );

                unsubscribeRef.current = unsubscribe;
            },
            onDisconnect: () => {
                isConnectingRef.current = false;
                setIsConnected(false);
            },
            onError: (error) => {
                isConnectingRef.current = false;
                setIsConnected(false);
                onErrorRef.current?.(error);
            },
        });
    }, [notebookId]);

    const disconnect = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        wsServiceRef.current.disconnect();
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback(
        (content: string, replyToMessageId?: string | null) => {
            const wsService = wsServiceRef.current;
            if (!wsService.isConnected()) {
                onError?.(new Error("WebSocket chưa kết nối"));
                return;
            }

            const request: SendMessageRequest = {
                content,
                replyToMessageId: replyToMessageId || null,
            };

            wsService.send(`/app/notebooks/${notebookId}/chat.send`, request);
        },
        [notebookId, onError]
    );

    const reactToMessage = useCallback(
        (messageId: string, emoji: string) => {
            const wsService = wsServiceRef.current;
            if (!wsService.isConnected()) {
                onError?.(new Error("WebSocket chưa kết nối"));
                return;
            }

            const request: ReactRequest = { messageId, emoji };
            wsService.send(`/app/notebooks/${notebookId}/chat.react`, request);
        },
        [notebookId, onError]
    );

    const sendTyping = useCallback(
        (isTyping: boolean) => {
            const wsService = wsServiceRef.current;
            if (!wsService.isConnected()) return;

            wsService.send(`/app/notebooks/${notebookId}/chat.typing`, { isTyping });

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
        connect().catch((error) => {
            console.error("Error connecting WebSocket:", error);
            onErrorRef.current?.(error);
        });
        return () => {
            disconnect();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebookId]);

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

