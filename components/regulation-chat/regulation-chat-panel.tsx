"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChatMessage,
  RegulationConversation,
  RegulationMessage,
  RegulationMessagesResponse,
} from "@/types/user/regulation-chat";
import ConversationList from "./conversation-list";
import api from "@/api/client/axios";

export default function RegulationChatPanel({
  selectedFileIds,
}: {
  selectedFileIds: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear messages when conversation or files change
  useEffect(() => {
    setMessages([]);
  }, [selectedFileIds, selectedConversationId]);

  // Load active conversation on mount
  useEffect(() => {
    loadActiveConversation();
  }, []);

  const loadActiveConversation = async () => {
    try {
      const response = await api.get<RegulationConversation>(
        "/user/regulation/chat/conversations/active"
      );
      if (response.status === 200 && response.data) {
        setSelectedConversationId(response.data.id);
      }
    } catch (error: any) {
      // 204 = no active conversation, that's fine
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
          // Prepend older messages
          setMessages((prev) => [...uiMessages, ...prev]);
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

  const handleSend = async () => {
    if (!input.trim() || selectedFileIds.length === 0) return;

    let currentConversationId = selectedConversationId;
    const currentInput = input;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
      timestamp: new Date(),
    };

    // Optimistic user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Temporary AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // 1. Create conversation if not exists
      if (!currentConversationId) {
        const title =
          currentInput.trim().slice(0, 50) +
          (currentInput.length > 50 ? "..." : "");
        const createRes = await api.post<RegulationConversation>(
          `/user/regulation/chat/conversations?title=${encodeURIComponent(
            title
          )}`
        );
        currentConversationId = createRes.data.id;
        setSelectedConversationId(currentConversationId);
        window.dispatchEvent(new CustomEvent("regulation-chat:refresh"));
        await api.post(
          `/user/regulation/chat/conversations/${currentConversationId}/active`
        );
      }

      // 2. Stream AI response
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386"
        }/user/regulation/chat/conversations/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Credentials will be sent via cookies automatically
          },
          body: JSON.stringify({
            content: currentInput,
            fileIds: selectedFileIds,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      // Read chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n"); // Assuming SSE format often uses double newlines

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;

            try {
              // Try parsing as JSON object first (for structured updates)
              const data = JSON.parse(dataStr);
              if (data.content) {
                aiContent += data.content;
              }

              // Handle citations/sources if present
              let currentSources = undefined;
              if (data.sources && Array.isArray(data.sources)) {
                currentSources = data.sources;
              }

              // Update UI
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: aiContent,
                        sources: currentSources || msg.sources,
                      }
                    : msg
                )
              );
            } catch {
              // If not JSON, assume raw text content (fallback)
              // But strictly speaking, we expect JSON chunks: { content: "...", ... }
              // Adjust based on your actual backend streaming format.
              // Common pattern: data: {"content": "Hello"}
              // If your API returns raw text in data:, use dataStr directly.
              // Assuming JSON based on typical RAG endpoints.

              // IF THE BACKEND SENDS PLAIN TEXT CHUNKS:
              // aiContent += dataStr;

              // Let's assume standard OpenAI-like streaming for now, or simple text.
              // If parsing fails, append raw string (removing quotes if it's a JSON string fragment)
              // Safety fallback:
              aiContent += dataStr.replace(/^"|"$/g, ""); // Remove quotes if simple string
            }

            // Update UI
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
              )
            );

            // Auto scroll to bottom
            if (scrollRef.current) {
              const scrollElement = scrollRef.current;
              scrollElement
                .querySelector("[data-radix-scroll-area-viewport]")
                ?.scrollTo({
                  top: scrollElement.scrollHeight,
                  behavior: "smooth",
                });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed AI message or show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: "Đã xảy ra lỗi khi nhận câu trả lời." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canChat = selectedFileIds.length > 0;

  return (
    <div className="flex h-full">
      {/* Conversation List - Left Side - Collapsible */}
      <div
        className={cn(
          "border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
          showConversations ? "w-64" : "w-0"
        )}
      >
        {showConversations && (
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
          />
        )}
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
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="bg-primary/10 rounded-full p-2">
                            <Bot className="size-4 text-primary" />
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] space-y-2",
                          message.role === "user" && "order-1"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          )}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground px-2">
                          {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {message.role === "user" && (
                        <div className="flex-shrink-0 mt-1 order-2">
                          <div className="bg-primary rounded-full p-2">
                            <User className="size-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-primary/10 rounded-full p-2">
                          <Bot className="size-4 text-primary" />
                        </div>
                      </div>
                      <div className="max-w-[80%]">
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-muted">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce delay-75" />
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce delay-150" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          <div className="p-4 flex-shrink-0 bg-muted/20">
            <div className="flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  canChat
                    ? "Nhập câu hỏi của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
                    : "Vui lòng chọn tài liệu trước khi hỏi..."
                }
                disabled={!canChat}
                className="resize-none min-h-[60px] max-h-[120px]"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !canChat}
                size="icon"
                className="flex-shrink-0 h-[60px] w-[60px]"
              >
                <Send className="size-5" />
                <span className="sr-only">Gửi</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              AI có thể mắc lỗi. Vui lòng tham khảo thêm văn bản gốc để có thông
              tin chính xác nhất.
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
