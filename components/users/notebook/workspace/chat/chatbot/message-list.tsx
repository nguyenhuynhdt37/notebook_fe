"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/api/client/axios";
import { ChatMessage, ListMessagesResponse } from "@/types/user/chatbot";
import { mapChatResponsesToChatMessages, formatTime } from "./utils";
import MessageItem from "./message-item";
import EmptyState from "./empty-state";
import LoadingIndicator from "./loading-indicator";
import { User } from "@/types/user/user";

interface MessageListProps {
  notebookId: string;
  selectedConversationId: string | null;
  selectedFileIds: string[];
  user: User | null;
}

export default function MessageList({
  notebookId,
  selectedConversationId,
  selectedFileIds,
  user,
}: MessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cursorNext, setCursorNext] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const lastConversationIdRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);
  const scrollPositionRef = useRef<number>(0);
  const scrollHeightRef = useRef<number>(0);
  const shouldScrollToBottomRef = useRef(false);

  // Load history messages
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setCursorNext(null);
      setHasMore(false);
      lastConversationIdRef.current = null;
      return;
    }

    // Prevent duplicate calls for the same conversation
    if (
      lastConversationIdRef.current === selectedConversationId &&
      loadingRef.current
    ) {
      return;
    }

    if (loadingRef.current) return;

    const load = async () => {
      try {
        loadingRef.current = true;
        lastConversationIdRef.current = selectedConversationId;
        setIsLoadingHistory(true);
        const response = await api.get<ListMessagesResponse>(
          `/user/notebooks/${notebookId}/bot-chat/conversations/${selectedConversationId}/messages`
        );

        const msgs = mapChatResponsesToChatMessages(response.data.messages);
        setMessages(msgs);
        setCursorNext(response.data.cursorNext);
        setHasMore(response.data.hasMore);
        // Scroll to bottom on initial load
        shouldScrollToBottomRef.current = true;
      } catch (error: any) {
        console.error("Error loading messages:", error);
        if (error.response?.status === 401) {
          window.location.href = "/login";
        } else if (error.response?.status === 404) {
          setMessages([]);
        } else {
          setMessages([]);
        }
      } finally {
        setIsLoadingHistory(false);
        loadingRef.current = false;
      }
    };

    load();
  }, [notebookId, selectedConversationId]);

  // Load more
  const loadMore = useCallback(async () => {
    if (
      !selectedConversationId ||
      isLoadingHistory ||
      !hasMore ||
      !cursorNext ||
      loadingRef.current
    )
      return;

    const container = containerRef.current;
    if (!container) return;

    try {
      loadingRef.current = true;
      isLoadingMoreRef.current = true;
      setIsLoadingHistory(true);

      // Save current scroll position and height before loading
      scrollPositionRef.current = container.scrollTop;
      scrollHeightRef.current = container.scrollHeight;

      const response = await api.get<ListMessagesResponse>(
        `/user/notebooks/${notebookId}/bot-chat/conversations/${selectedConversationId}/messages?cursorNext=${cursorNext}`
      );

      const msgs = mapChatResponsesToChatMessages(response.data.messages);
      setMessages((prev) => [...prev, ...msgs]);
      setCursorNext(response.data.cursorNext);
      setHasMore(response.data.hasMore);
    } catch (error: any) {
      console.error("Error loading more:", error);
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
    } finally {
      setIsLoadingHistory(false);
      loadingRef.current = false;
    }
  }, [
    notebookId,
    selectedConversationId,
    isLoadingHistory,
    hasMore,
    cursorNext,
  ]);

  // Scroll handler with throttling to prevent jank
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (container.scrollTop < 100 && hasMore && !isLoadingHistory) {
            loadMore();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingHistory, loadMore]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (isLoadingMoreRef.current && containerRef.current) {
      const container = containerRef.current;

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (!container) return;

        const newScrollHeight = container.scrollHeight;
        const heightDifference = newScrollHeight - scrollHeightRef.current;

        // Restore scroll position by adding the height difference
        // This keeps the user at the same visual position
        // Use scrollTop directly without smooth behavior to avoid jank
        container.scrollTop = scrollPositionRef.current + heightDifference;
        isLoadingMoreRef.current = false;
      });
    }
  }, [messages.length]);

  // Scroll to bottom on new message (only when not loading more)
  useEffect(() => {
    if (
      !isLoadingHistory &&
      messages.length > 0 &&
      !isLoadingMoreRef.current &&
      shouldScrollToBottomRef.current
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottomRef.current = false;
    }
  }, [messages.length, isLoadingHistory]);

  // Copy handler
  const handleCopy = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Listen for new messages (from input component)
  useEffect(() => {
    const handleNewMessage = (e: CustomEvent<ChatMessage>) => {
      // Add to end of array (backend already sorted correctly)
      setMessages((prev) => [...prev, e.detail]);
      // Mark that we should scroll to bottom for new user messages
      shouldScrollToBottomRef.current = true;
    };

    const handleLoadingMessage = (e: CustomEvent<ChatMessage>) => {
      // Add to end of array (backend already sorted correctly)
      setMessages((prev) => [...prev, e.detail]);
      // Mark that we should scroll to bottom for loading messages
      shouldScrollToBottomRef.current = true;
    };

    const handleRemoveLoading = (e: CustomEvent<string>) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== e.detail));
    };

    window.addEventListener(
      "chatbot:new-message",
      handleNewMessage as EventListener
    );
    window.addEventListener(
      "chatbot:loading-message",
      handleLoadingMessage as EventListener
    );
    window.addEventListener(
      "chatbot:remove-loading",
      handleRemoveLoading as EventListener
    );

    return () => {
      window.removeEventListener(
        "chatbot:new-message",
        handleNewMessage as EventListener
      );
      window.removeEventListener(
        "chatbot:loading-message",
        handleLoadingMessage as EventListener
      );
      window.removeEventListener(
        "chatbot:remove-loading",
        handleRemoveLoading as EventListener
      );
    };
  }, []);

  // Show empty state khi: chưa chọn conversation HOẶC đã chọn nhưng không có message
  if (messages.length === 0 && !isLoadingHistory) {
    return <EmptyState selectedFileIds={selectedFileIds} />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 scroll-smooth"
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {isLoadingHistory && hasMore && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground/70 font-medium">
              Đang tải tin nhắn cũ...
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            user={user}
            copiedId={copiedId}
            onCopy={handleCopy}
            formatTime={formatTime}
            notebookId={notebookId}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
