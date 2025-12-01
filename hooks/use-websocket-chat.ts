"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getWebSocketService } from "@/lib/services/websocket";
import { getCookie } from "@/lib/utils/cookie";
import api from "@/api/client/axios";
import type {
    Message,
    SendMessageRequest,
    ReactRequest,
    ReactionUpdate,
    TypingNotification,
    ChatHistoryResponse,
} from "@/types/chat/message";

interface UseWebSocketChatOptions {
    notebookId: string;
    onError?: (error: Error) => void;
}

export function useWebSocketChat({ notebookId, onError }: UseWebSocketChatOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingNotification>>(
        new Map()
    );
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const wsServiceRef = useRef(getWebSocketService());
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                if (page === 0) {
                    setMessages(data.content.reverse());
                } else {
                    setMessages((prev) => [...data.content.reverse(), ...prev]);
                }

                setHasMore(!data.last);
                setCurrentPage(page);
            } catch (error) {
                console.error("Error loading chat history:", error);
                onError?.(new Error("Không thể tải lịch sử chat"));
            } finally {
                setIsLoading(false);
            }
        },
        [notebookId, onError]
    );

    const connect = useCallback(() => {
        const token = getCookie("AUTH-TOKEN");
        if (!token) {
            onError?.(new Error("Không tìm thấy token xác thực"));
            return;
        }

        const wsService = wsServiceRef.current;

        wsService.connect({
            token,
            onConnect: () => {
                setIsConnected(true);

                const unsubscribe = wsService.subscribe(
                    `/topic/notebooks/${notebookId}/chat`,
                    (message) => {
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
                            }
                        } catch (error) {
                            console.error("Error parsing WebSocket message:", error);
                        }
                    }
                );

                unsubscribeRef.current = unsubscribe;
                loadHistory(0);
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
            onError: (error) => {
                setIsConnected(false);
                onError?.(error);
            },
        });
    }, [notebookId, loadHistory, onError]);

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
        connect();
        return () => {
            disconnect();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [connect, disconnect]);

    return {
        messages,
        isConnected,
        isLoading,
        typingUsers: Array.from(typingUsers.values()),
        hasMore,
        sendMessage,
        reactToMessage,
        sendTyping,
        loadMore,
    };
}

