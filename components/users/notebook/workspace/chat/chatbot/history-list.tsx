"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import api from "@/api/client/axios";
import {
  ChatConversation,
  ChatConversationsResponse,
} from "@/types/user/chatbot";
import HistoryItem from "./history-item";
import { formatConversationTime } from "./utils";

interface HistoryListProps {
  notebookId: string;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onClearSelection?: () => void;
  isLoadingActive?: boolean;
}

export default function HistoryList({
  notebookId,
  selectedConversationId,
  onSelectConversation,
  onClearSelection,
  isLoadingActive = false,
}: HistoryListProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cursorNext, setCursorNext] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const onSelectRef = useRef(onSelectConversation);

  // Keep ref updated
  useEffect(() => {
    onSelectRef.current = onSelectConversation;
  }, [onSelectConversation]);

  // Create new conversation
  const createConversation = useCallback(async () => {
    try {
      const response = await api.post<ChatConversation>(
        `/user/notebooks/${notebookId}/bot-chat/conversations?title=New%20chat`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }, [notebookId]);

  // Load conversations function
  const loadConversations = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      const response = await api.get<ChatConversationsResponse>(
        `/user/notebooks/${notebookId}/bot-chat/conversations`
      );
      setConversations(response.data.conversations);
      setCursorNext(response.data.cursorNext);
      setHasMore(response.data.hasMore);

      // Wait for active conversation to be loaded before auto-selecting
      // If still loading active conversation, don't auto-select yet
      if (isLoadingActive) {
        return;
      }

      // Only auto-select if no conversation is already selected (from active conversation)
      // If selectedConversationId is already set (from active conversation), don't override it
      if (selectedConversationId) {
        return;
      }

      // If empty, create new conversation
      if (response.data.conversations.length === 0) {
        try {
          const newConversation = await createConversation();
          setConversations([newConversation]);
          onSelectRef.current(newConversation.id);
        } catch (error) {
          console.error("Error creating new conversation:", error);
        }
        return;
      }

      // Auto-select latest if no active conversation was found
      if (response.data.conversations.length > 0) {
        const latest = response.data.conversations.reduce((prev, curr) => {
          const prevTime = prev.updatedAt
            ? new Date(prev.updatedAt).getTime()
            : new Date(prev.createdAt).getTime();
          const currTime = curr.updatedAt
            ? new Date(curr.updatedAt).getTime()
            : new Date(curr.createdAt).getTime();
          return currTime > prevTime ? curr : prev;
        });
        onSelectRef.current(latest.id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [notebookId, selectedConversationId, isLoadingActive, createConversation]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Reload conversations when active conversation loading is done
  // This ensures we don't auto-select before active conversation is loaded
  useEffect(() => {
    if (!isLoadingActive && conversations.length === 0) {
      // If active loading is done and we have no conversations, load them
      loadConversations();
    }
  }, [isLoadingActive, conversations.length, loadConversations]);

  // Listen for refresh event
  useEffect(() => {
    const handleRefresh = () => {
      loadConversations();
    };

    window.addEventListener("chatbot:refresh-conversations", handleRefresh);
    return () =>
      window.removeEventListener(
        "chatbot:refresh-conversations",
        handleRefresh
      );
  }, [loadConversations]);

  // Load more
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursorNext) return;

    try {
      setIsLoading(true);
      const response = await api.get<ChatConversationsResponse>(
        `/user/notebooks/${notebookId}/bot-chat/conversations?cursorNext=${cursorNext}`
      );
      setConversations((prev) => [...prev, ...response.data.conversations]);
      setCursorNext(response.data.cursorNext);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoading(false);
    }
  }, [notebookId, isLoading, hasMore, cursorNext]);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (scrollBottom < 200) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // Handle delete conversation
  const handleDelete = useCallback(
    (conversationId: string) => {
      // Remove from list
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      // If deleted conversation was selected, clear selection or select another
      if (selectedConversationId === conversationId) {
        const remaining = conversations.filter(
          (conv) => conv.id !== conversationId
        );
        if (remaining.length > 0) {
          // Select the latest remaining conversation
          const latest = remaining.reduce((prev, curr) => {
            const prevTime = prev.updatedAt
              ? new Date(prev.updatedAt).getTime()
              : new Date(prev.createdAt).getTime();
            const currTime = curr.updatedAt
              ? new Date(curr.updatedAt).getTime()
              : new Date(curr.createdAt).getTime();
            return currTime > prevTime ? curr : prev;
          });
          onSelectConversation(latest.id);
        } else {
          // No conversations left, clear selection
          onClearSelection?.();
        }
      }

      // Refresh conversations list
      window.dispatchEvent(new CustomEvent("chatbot:refresh-conversations"));
    },
    [
      selectedConversationId,
      conversations,
      onSelectConversation,
      onClearSelection,
    ]
  );

  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Chưa có lịch sử chat
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scroll-smooth"
    >
      {conversations.map((conversation) => (
        <HistoryItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversationId === conversation.id}
          notebookId={notebookId}
          onClick={() => onSelectConversation(conversation.id)}
          onDelete={handleDelete}
        />
      ))}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasMore && conversations.length > 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground/60">Đã hiển thị tất cả</p>
        </div>
      )}
    </div>
  );
}
