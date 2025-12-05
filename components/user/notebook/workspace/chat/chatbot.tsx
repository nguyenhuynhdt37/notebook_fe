"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import { useUserStore } from "@/stores/user";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatbotProps {
  notebookId: string;
}

export default function Chatbot({ notebookId }: ChatbotProps) {
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post(
        `/api/notebooks/${notebookId}/chatbot`,
        {
          message: userMessage.content,
        }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response || response.data.message || "Xin lỗi, tôi không thể trả lời.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 px-4 sm:px-6 py-4 flex items-center gap-4 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-sm relative z-10">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 shadow-sm border border-border/30">
          <Bot className="size-4.5 text-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground">Chatbot AI</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hỏi đáp với AI về notebook
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-gradient-to-b from-background via-background to-muted/10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Bot className="size-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              Bắt đầu trò chuyện với AI
            </h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Hỏi bất kỳ điều gì về notebook này, AI sẽ giúp bạn trả lời.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
              )}
            >
              {!isUser && (
                <Avatar className="size-8 shadow-sm shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              {isUser && user && (
                <Avatar className="size-8 shadow-sm shrink-0">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "flex flex-col gap-1.5 flex-1",
                  isUser ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 relative shadow-sm max-w-[70%]",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-background border border-border/60 text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground px-2">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="size-8 shadow-sm shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <div className="rounded-2xl px-4 py-3 bg-background border border-border/60 shadow-sm">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/60 bg-gradient-to-t from-background to-muted/10 p-4 shrink-0 shadow-lg">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
              rows={1}
              className={cn(
                "flex-1 w-full min-h-[48px] max-h-[120px] resize-none rounded-xl border border-border/60 bg-background px-4 py-3 pr-12 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "placeholder:text-muted-foreground/60"
              )}
            />
            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/60">
              Enter để gửi
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={cn(
              "shrink-0 size-11 rounded-xl shadow-sm transition-all",
              !input.trim() || isLoading
                ? "opacity-50"
                : "hover:shadow-md hover:scale-105"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

