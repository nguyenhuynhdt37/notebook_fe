"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Message, Reaction } from "@/types/chat/message";
import ReactionPicker from "./reaction-picker";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";

interface MessageListProps {
    messages: Message[];
    onReply: (message: Message) => void;
    onReact: (messageId: string, emoji: string) => void;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
}

export default function MessageList({
    messages,
    onReply,
    onReact,
    onLoadMore,
    hasMore,
    isLoading,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
        null
    );
    const [isNearTop, setIsNearTop] = useState(false);
    const user = useUserStore((state) => state.user);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isNearTop) {
            scrollToBottom();
        }
    }, [messages.length, isNearTop]);

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const container = messagesContainerRef.current;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        setIsNearTop(scrollTop < 100);

        if (scrollTop < 50 && hasMore && !isLoading) {
            const previousScrollHeight = scrollHeight;
            onLoadMore();
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight;
                    const heightDiff = newScrollHeight - previousScrollHeight;
                    messagesContainerRef.current.scrollTop = scrollTop + heightDiff;
                }
            }, 0);
        }
    };

    const formatTime = (dateString: string) => {
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
    };

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getReactionCount = (reactions: Reaction[], emoji: string) => {
        return reactions.filter((r) => r.emoji === emoji).length;
    };

    const hasUserReacted = (reactions: Reaction[], emoji: string) => {
        if (!user) return false;
        return reactions.some(
            (r) => r.emoji === emoji && r.user.id === user.id.toString()
        );
    };

    return (
        <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
        >
            {isLoading && messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    Đang tải tin nhắn...
                </div>
            )}

            {messages.map((message) => {
                const isOwnMessage = user && message.user?.id === user.id.toString();
                const replyToMessage = message.replyToMessageId
                    ? messages.find((m) => m.id === message.replyToMessageId)
                    : null;

                return (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3 group",
                            isOwnMessage ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        {!isOwnMessage && (
                            <Avatar className="size-8 shrink-0">
                                {message.user?.avatarUrl ? (
                                    <AvatarImage src={message.user.avatarUrl} />
                                ) : null}
                                <AvatarFallback>
                                    {message.user
                                        ? getUserInitials(message.user.fullName)
                                        : "?"}
                                </AvatarFallback>
                            </Avatar>
                        )}

                        <div
                            className={cn(
                                "flex flex-col gap-1 max-w-[70%]",
                                isOwnMessage ? "items-end" : "items-start"
                            )}
                        >
                            {!isOwnMessage && message.user && (
                                <span className="text-xs text-muted-foreground px-2">
                                    {message.user.fullName}
                                </span>
                            )}

                            <div
                                className={cn(
                                    "rounded-lg px-4 py-2 relative",
                                    isOwnMessage
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                )}
                            >
                                {replyToMessage && (
                                    <div
                                        className={cn(
                                            "text-xs mb-2 pb-2 border-b opacity-70",
                                            isOwnMessage ? "border-primary-foreground/30" : "border-border"
                                        )}
                                    >
                                        <div className="font-medium">
                                            {replyToMessage.user?.fullName || "Người dùng"}
                                        </div>
                                        <div className="line-clamp-1">{replyToMessage.content}</div>
                                    </div>
                                )}

                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                    {message.content}
                                </p>

                                <div className="flex items-center gap-2 mt-2">
                                    {message.reactions.length > 0 && (
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {Array.from(new Set(message.reactions.map((r) => r.emoji))).map(
                                                (emoji) => {
                                                    const count = getReactionCount(message.reactions, emoji);
                                                    const reacted = hasUserReacted(message.reactions, emoji);
                                                    return (
                                                        <Button
                                                            key={emoji}
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className={cn(
                                                                "h-6 px-2 text-xs rounded-full",
                                                                reacted
                                                                    ? "bg-primary/20 hover:bg-primary/30"
                                                                    : "bg-muted hover:bg-muted/80"
                                                            )}
                                                            onClick={() => onReact(message.id, emoji)}
                                                        >
                                                            <span>{emoji}</span>
                                                            <span>{count}</span>
                                                        </Button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setShowReactionPicker(message.id)}
                                            className="h-6 w-6"
                                        >
                                            <span className="text-xs">😊</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => onReply(message)}
                                            className="h-6 w-6"
                                        >
                                            <span className="text-xs">↩️</span>
                                        </Button>
                                    </div>
                                </div>

                                {showReactionPicker === message.id && (
                                    <div className="absolute bottom-full left-0 mb-2 z-10">
                                        <ReactionPicker
                                            onSelect={(emoji) => {
                                                onReact(message.id, emoji);
                                                setShowReactionPicker(null);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <span className="text-xs text-muted-foreground px-2">
                                {formatTime(message.createdAt)}
                            </span>
                        </div>
                    </div>
                );
            })}

            <div ref={messagesEndRef} />
        </div>
    );
}

