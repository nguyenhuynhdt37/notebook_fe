"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileQuestion,
  Bot,
  User,
  Files,
  PanelLeftClose,
  PanelLeft,
  Loader2,
} from "lucide-react";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ChatMessage,
  RegulationConversation,
  RegulationMessage,
  RegulationMessagesResponse,
  UploadedImage,
} from "@/types/user/regulation-chat";
import ConversationList from "./conversation-list";
import ChatInput from "./chat-input";
import MessageItem from "./message-item";
import api from "@/api/client/axios";

export default function RegulationChatPanel({
  selectedFileIds,
}: {
  selectedFileIds: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showConversations, setShowConversations] = useState(false);
  const [cursorNext, setCursorNext] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingHistoryRef = useRef(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear messages when files change
  useEffect(() => {
    if (selectedFileIds.length > 0) {
      // Logic for file selection change if needed
    }
  }, [selectedFileIds]);

  // Load active conversation only after list is loaded
  const handleListLoaded = useCallback(async () => {
    // Only load if not already loaded (to avoid double load on strict mode or re-renders)
    if (!selectedConversationId) {
      await loadActiveConversation();
    }
  }, [selectedConversationId]);

  /* 
  // Removed direct mount loading - waiting for list now
  useEffect(() => {
    loadActiveConversation();
  }, []);
  */

  // Load messages when conversation ID changes
  useEffect(() => {
    if (selectedConversationId) {
      setMessages([]);
      setCursorNext(null);
      setHasMore(false);
      loadMessages(selectedConversationId, true);
    }
  }, [selectedConversationId]);

  const loadActiveConversation = async () => {
    try {
      const response = await api.get<RegulationConversation>(
        "/user/regulation/chat/conversations/active"
      );
      if (response.status === 200 && response.data) {
        setSelectedConversationId(response.data.id);
      }
    } catch (error: any) {
      if (error.response?.status !== 204) {
        console.error("Error loading active conversation:", error);
      }
    }
  };

  const handleCreateNew = useCallback(async () => {
    try {
      const response = await api.post<RegulationConversation>(
        "/user/regulation/chat/conversations?title=Cuộc%20trò%20chuyện%20mới"
      );
      const newConversation = response.data;

      // Refresh list
      window.dispatchEvent(new CustomEvent("regulation-chat:refresh"));

      // Select new conversation
      setSelectedConversationId(newConversation.id);
      setMessages([]);

      // Set active on server
      await api.post(
        `/user/regulation/chat/conversations/${newConversation.id}/active`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: string, reset = false) => {
      if (loadingHistoryRef.current) return;
      if (!reset && !hasMore) return;

      try {
        loadingHistoryRef.current = true;
        setIsLoadingHistory(true);

        const url =
          reset || !cursorNext
            ? `/user/regulation/chat/conversations/${conversationId}/messages?limit=25`
            : `/user/regulation/chat/conversations/${conversationId}/messages?limit=25&cursorNext=${cursorNext}`;

        const response = await api.get<RegulationMessagesResponse>(url);
        const data = response.data;

        // Handle both direct response and nested data
        // API returns { messages, cursorNext, hasMore }
        const items = (data as any).messages || (data as any).items || [];

        // Convert API messages to UI messages
        const uiMessages: ChatMessage[] =
          items.length > 0
            ? (items as RegulationMessage[]).map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.createdAt),
              }))
            : [];

        if (reset) {
          setMessages(uiMessages);
        } else {
          // Prepend older messages and deduplicate
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUniqueMessages = uiMessages.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...newUniqueMessages, ...prev];
          });
        }

        setCursorNext(data.cursorNext || null);
        setHasMore(data.hasMore ?? false);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsLoadingHistory(false);
        loadingHistoryRef.current = false;
      }
    },
    [cursorNext, hasMore]
  );

  // Infinite scroll - load older messages when scrolling to top
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !selectedConversationId) return;

    const viewport = scrollElement.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop } = viewport;

      // Load more when scrolled near top (< 50px from top)
      if (scrollTop < 50 && hasMore && !loadingHistoryRef.current) {
        loadMessages(selectedConversationId, false);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [selectedConversationId, hasMore, loadMessages]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      try {
        // Set active
        await api.post(`/user/regulation/chat/conversations/${id}/active`);
        setSelectedConversationId(id);

        // Load messages
        setCursorNext(null);
        setHasMore(false);
        await loadMessages(id, true);
      } catch (error) {
        console.error("Error setting active conversation:", error);
      }
    },
    [loadMessages]
  );

  const handleSend = useCallback(
    async (content: string, images?: UploadedImage[]) => {
      if ((!content.trim() && !images?.length) || selectedFileIds.length === 0)
        return;

      setIsLoading(true);

      // Optimistic user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: content,
        timestamp: new Date(),
        images: images,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Temporary AI message placeholder
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      try {
        // Call chat API
        const response = await api.post("/user/regulation/chat", {
          message: content,
          conversationId: selectedConversationId,
          fileIds: selectedFileIds.length > 0 ? selectedFileIds : null,
          images: images || null,
        });

        const data = response.data;

        // Update conversation ID if this was first message
        if (!selectedConversationId && data.conversationId) {
          setSelectedConversationId(data.conversationId);
          window.dispatchEvent(new CustomEvent("regulation-chat:refresh"));
        }

        // Update AI message with real response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  id: data.id || aiMessageId,
                  content: data.content || "",
                  sources: data.sources || undefined,
                  timestamp: data.createdAt
                    ? new Date(data.createdAt)
                    : new Date(),
                  isTyping: true, // Enable typing effect
                }
              : msg
          )
        );
      } catch (error: any) {
        console.error("Error sending message:", error);

        // Show error in AI message
        const errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi nhận câu trả lời.";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `❌ ${errorMessage}` }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedConversationId, selectedFileIds]
  );

  const canChat = selectedFileIds.length > 0;

  return (
    <div className="flex h-full">
      {/* Conversation List - Left Side - Collapsible */}
      <div
        className={cn(
          "border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
          showConversations ? "w-64" : "w-0"
        )}
      >
        {/* Always mount ConversationList to fetch data, just hide it */}
        <div className={cn("h-full w-64", !showConversations && "hidden")}>
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
            onConversationCreated={(id) => {
              setSelectedConversationId(id);
              setMessages([]);
              setShowConversations(false);
            }}
            onConversationDeleted={() => {
              setSelectedConversationId(null);
              setMessages([]);
            }}
            onLoaded={handleListLoaded}
          />
        </div>
      </div>

      {/* Chat Area - Right Side */}
      <div className="flex flex-col flex-1">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversations(!showConversations)}
                  title={showConversations ? "Ẩn lịch sử" : "Hiện lịch sử"}
                  className="flex-shrink-0"
                >
                  {showConversations ? (
                    <PanelLeftClose className="size-4" />
                  ) : (
                    <PanelLeft className="size-4" />
                  )}
                </Button>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Files className="size-5 text-primary" />
                  Trợ lý AI Quy chế
                </CardTitle>
                {selectedFileIds.length > 0 && (
                  <Badge variant="default">
                    {selectedFileIds.length} tài liệu
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {selectedFileIds.length === 0
                  ? "Chọn ít nhất một tài liệu để bắt đầu hỏi đáp"
                  : selectedFileIds.length === 1
                  ? "AI sẽ trả lời dựa trên tài liệu đã chọn"
                  : `AI sẽ tìm kiếm và trả lời dựa trên ${selectedFileIds.length} tài liệu đã chọn`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollRef}>
              {!canChat ? (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="bg-muted/50 rounded-full p-6 w-fit mx-auto">
                      <FileQuestion className="size-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        Chọn tài liệu để bắt đầu
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Sử dụng checkbox bên trái để chọn một hoặc nhiều tài
                        liệu. AI sẽ trả lời câu hỏi dựa trên nội dung các tài
                        liệu đã chọn.
                      </p>
                    </div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="bg-primary/5 rounded-full p-4 w-fit mx-auto">
                      <Bot className="size-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Sẵn sàng trả lời câu hỏi
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Đặt câu hỏi về{" "}
                        {selectedFileIds.length === 1
                          ? "tài liệu"
                          : "các tài liệu"}{" "}
                        đã chọn. Ví dụ: "Các quy định chính là gì?"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {isLoadingHistory && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      copiedId={copiedId}
                      onCopy={handleCopy}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <ChatInput
            onSend={handleSend}
            disabled={!canChat}
            isLoading={isLoading}
            placeholder="Nhập câu hỏi của bạn"
          />
        </CardContent>
      </div>
    </div>
  );
}
