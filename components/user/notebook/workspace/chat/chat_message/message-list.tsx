"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Message, Reaction, OnlineStatus } from "@/types/chat/message";
import ReactionPicker from "./reaction-picker";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";
import { Smile, Reply, Loader2 } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(false);
  const user = useUserStore((state) => state.user);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (!isNearTop) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isNearTop]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight } = containerRef.current;

    setIsNearTop(scrollTop < 100);

    if (scrollTop < 50 && hasMore && !isLoading) {
      const prevHeight = scrollHeight;
      onLoadMore();
      setTimeout(() => {
        if (containerRef.current) {
          const newHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = scrollTop + (newHeight - prevHeight);
        }
      }, 0);
    }
  };

  // Helpers
  const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const isOnline = (userId: string | null) =>
    userId ? onlineUsers.some((u) => u.userId === userId && u.isOnline) : false;

  const getReactionCount = (reactions: Reaction[], emoji: string) =>
    reactions.filter((r) => r.emoji === emoji).length;

  const hasReacted = (reactions: Reaction[], emoji: string) =>
    user?.id
      ? reactions.some(
          (r) => r.emoji === emoji && r.user.id === user.id.toString()
        )
      : false;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      {/* Loading state */}
      {isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => {
        const isOwn = user && message.user?.id === user.id.toString();
        const replyTo = message.replyToMessageId
          ? messages.find((m) => m.id === message.replyToMessageId)
          : null;

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 group",
              isOwn ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            {!isOwn && (
              <div className="relative shrink-0">
                <Avatar className="size-9">
                  <AvatarImage src={message.user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {message.user ? getInitials(message.user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                {message.user && isOnline(message.user.id) && (
                  <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
            )}

            {/* Message content */}
            <div
              className={cn(
                "flex flex-col gap-1 max-w-[60%]",
                isOwn ? "items-end" : "items-start"
              )}
            >
              {/* Sender name */}
              {!isOwn && message.user && (
                <span className="text-xs font-medium text-muted-foreground px-1">
                  {message.user.fullName}
                </span>
              )}

              {/* Message bubble */}
              <div className="relative group/bubble">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5",
                    isOwn
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  {/* Reply preview */}
                  {replyTo && (
                    <div
                      className={cn(
                        "text-xs mb-2 pb-2 border-l-2 pl-2",
                        isOwn
                          ? "border-background/40 opacity-70"
                          : "border-foreground/20"
                      )}
                    >
                      <p className="font-medium">
                        {replyTo.user?.fullName || "Người dùng"}
                      </p>
                      <p className="line-clamp-1 opacity-80">
                        {replyTo.content}
                      </p>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Array.from(
                        new Set(message.reactions.map((r) => r.emoji))
                      ).map((emoji) => (
                        <Button
                          key={emoji}
                          variant={
                            hasReacted(message.reactions, emoji)
                              ? "secondary"
                              : "ghost"
                          }
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => onReact(message.id, emoji)}
                        >
                          {emoji} {getReactionCount(message.reactions, emoji)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div
                  className={cn(
                    "absolute flex gap-0.5 opacity-0 group-hover/bubble:opacity-100 transition-opacity -bottom-7",
                    isOwn ? "right-0" : "left-0"
                  )}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Smile className="size-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align={isOwn ? "end" : "start"}
                      className="w-auto p-1"
                    >
                      <ReactionPicker
                        onSelect={(emoji) => onReact(message.id, emoji)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onReply(message)}
                  >
                    <Reply className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-muted-foreground px-1">
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
