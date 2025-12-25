"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import {
  RegulationConversation,
  RegulationConversationsResponse,
} from "@/types/user/regulation-chat";
import NewChatButton from "./new-chat-button";
import DeleteConversationButton from "./delete-conversation-button";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConversationCreated: (id: string) => void;
  onConversationDeleted?: () => void;
  onLoaded?: () => void;
}

export default function ConversationList({
  selectedId,
  onSelect,
  onConversationCreated,
  onConversationDeleted,
  onLoaded,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<RegulationConversation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [cursorNext, setCursorNext] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadConversations = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      if (!reset && !hasMore) return;

      try {
        loadingRef.current = true;
        setIsLoading(true);

        const url =
          reset || !cursorNext
            ? "/user/regulation/chat/conversations?limit=25"
            : `/user/regulation/chat/conversations?limit=25&cursorNext=${cursorNext}`;

        const response = await api.get<{
          data: RegulationConversationsResponse;
        }>(url);
        const data = response.data.data || response.data;
        const conversationsParams =
          data.conversations || (data as any).items || [];

        if (reset) {
          setConversations(conversationsParams);
        } else {
          setConversations((prev) => [...prev, ...conversationsParams]);
        }

        setCursorNext(data.cursorNext || null);
        setHasMore(data.hasMore ?? false);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
        if (reset && onLoaded) {
          onLoaded();
        }
      }
    },
    [cursorNext, hasMore, onLoaded]
  );

  useEffect(() => {
    loadConversations(true);
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => loadConversations(true);
    window.addEventListener("regulation-chat:refresh", handleRefresh);
    return () =>
      window.removeEventListener("regulation-chat:refresh", handleRefresh);
  }, [loadConversations]);

  // Infinite scroll
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // ScrollArea wraps content in a viewport div
    const viewport = scrollElement.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Load more when 100px from bottom
      if (scrollBottom < 100 && hasMore && !loadingRef.current) {
        loadConversations(false);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadConversations]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleConversationCreated = (id: string) => {
    onConversationCreated(id);
  };

  const handleDelete = (
    conversationId: string,
    nextConversation?: RegulationConversation
  ) => {
    // Remove deleted conversation from list
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));

    // If deleted conversation was selected
    if (selectedId === conversationId) {
      if (nextConversation) {
        // API returned next conversation, select it
        onSelect(nextConversation.id);
      } else {
        // No next conversation, clear selection
        onConversationDeleted?.();
      }
    }
  };

  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="size-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Chưa có lịch sử chat
        </p>
        <Button size="sm" onClick={() => handleConversationCreated("")}>
          Chat mới
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <NewChatButton onCreated={handleConversationCreated} />

      <ScrollArea className="flex-1 h-0" ref={scrollRef}>
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group relative rounded-lg transition-colors",
                selectedId === conv.id ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <button
                onClick={() => {
                  if (selectedId !== conv.id) {
                    onSelect(conv.id);
                  }
                }}
                className="w-full text-left px-3 py-2 pr-10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate flex-1 text-sm",
                      selectedId === conv.id
                        ? "text-primary font-medium"
                        : "text-foreground/80"
                    )}
                  >
                    {conv.title || "Cuộc trò chuyện"}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(conv.updatedAt || conv.createdAt)}
                  </span>
                </div>
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteConversationButton
                  conversationId={conv.id}
                  conversationTitle={conv.title || ""}
                  onDeleted={(nextConversation) =>
                    handleDelete(conv.id, nextConversation)
                  }
                />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasMore && conversations.length > 0 && (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground/60">
                Đã hiển thị tất cả
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
