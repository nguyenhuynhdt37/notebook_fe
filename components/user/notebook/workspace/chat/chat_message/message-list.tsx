"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Message, Reaction, OnlineStatus } from "@/types/chat/message";
import ReactionPicker from "./reaction-picker";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";
import { Smile, Reply } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageListProps {
  messages: Message[];
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onlineUsers?: OnlineStatus[];
}

export default function MessageList({
  messages,
  onReply,
  onReact,
  onLoadMore,
  hasMore,
  isLoading,
  onlineUsers = [],
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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

  const isUserOnline = (userId: string | null) => {
    if (!userId) return false;
    return onlineUsers.some((u) => u.userId === userId && u.isOnline);
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-gradient-to-b from-background via-background to-muted/5"
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
              <div className="relative shrink-0">
                <Avatar className="size-10 shadow-sm">
                  {message.user?.avatarUrl ? (
                    <AvatarImage src={message.user.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {message.user
                      ? getUserInitials(message.user.fullName)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                {message.user && isUserOnline(message.user.id) && (
                  <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                )}
              </div>
            )}

            <div
              className={cn(
                "flex flex-col gap-1.5 flex-1",
                isOwnMessage ? "items-end" : "items-start"
              )}
            >
              {!isOwnMessage && message.user && (
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs font-semibold text-foreground">
                    {message.user.fullName}
                  </span>
                </div>
              )}

              <div className="relative group/message max-w-[50%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 relative shadow-md w-full transition-all duration-200",
                    isOwnMessage
                      ? "bg-primary text-primary-foreground rounded-br-md shadow-lg"
                      : "bg-background border border-border/60 text-foreground rounded-bl-md hover:shadow-lg hover:border-border/80"
                  )}
                >
                  {replyToMessage && (
                    <div
                      className={cn(
                        "text-xs mb-3 pb-2.5 border-l-2 pl-3 rounded-lg",
                        isOwnMessage
                          ? "border-primary-foreground/40 bg-primary-foreground/10"
                          : "border-border/60 bg-muted/40"
                      )}
                    >
                      <div className="font-semibold mb-1">
                        {replyToMessage.user?.fullName || "Người dùng"}
                      </div>
                      <div className="line-clamp-2 opacity-80">
                        {replyToMessage.content}
                      </div>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {message.content}
                  </p>

                  {message.reactions.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {Array.from(
                        new Set(message.reactions.map((r) => r.emoji))
                      ).map((emoji) => {
                        const count = getReactionCount(
                          message.reactions,
                          emoji
                        );
                        const reacted = hasUserReacted(
                          message.reactions,
                          emoji
                        );
                        return (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                              "h-7 px-2.5 text-xs rounded-full transition-all duration-200",
                              reacted
                                ? "bg-primary/20 hover:bg-primary/30 border border-primary/30 shadow-sm"
                                : "bg-muted/50 hover:bg-muted/70 border border-border/50 hover:shadow-sm"
                            )}
                            onClick={() => onReact(message.id, emoji)}
                          >
                            <span className="text-sm">{emoji}</span>
                            <span className="ml-1 font-medium">{count}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={cn(
                      "absolute flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity",
                      isOwnMessage ? "-bottom-8 right-0" : "-bottom-8 left-0"
                    )}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 rounded-lg hover:bg-muted/80 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                          <Smile className="size-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align={isOwnMessage ? "end" : "start"}
                        className="w-auto p-1.5"
                      >
                        <ReactionPicker
                          onSelect={(emoji) => {
                            onReact(message.id, emoji);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onReply(message)}
                      className="h-7 w-7 rounded-lg hover:bg-muted/80 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Reply className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-muted-foreground px-2 mt-1">
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
