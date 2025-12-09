"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, replyToMessageId?: string | null) => void;
  onTyping: (isTyping: boolean) => void;
  replyToMessage: { id: string; content: string; userName: string } | null;
  onCancelReply: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onTyping,
  replyToMessage,
  onCancelReply,
  disabled,
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend(content.trim(), replyToMessage?.id || null);
    setContent("");
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-border/60 bg-gradient-to-t from-background via-background to-muted/10 p-4 space-y-3 shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      {replyToMessage && (
        <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0 border border-primary/20">
            <Reply className="size-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-foreground">
                Trả lời {replyToMessage.userName}
              </span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {replyToMessage.content}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCancelReply}
            className="shrink-0 h-7 w-7 hover:bg-muted"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 w-full min-h-[48px] max-h-[120px] resize-none rounded-xl border border-border/60 bg-background/90 backdrop-blur-sm px-4 py-3 pr-12 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring/60 focus-visible:shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "placeholder:text-muted-foreground/60 transition-all"
            )}
          />
          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/60">
            Enter để gửi
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          size="icon"
          className={cn(
            "shrink-0 size-11 rounded-xl shadow-sm transition-all duration-200",
            !content.trim() || disabled
              ? "opacity-50"
              : "hover:shadow-lg hover:scale-105 active:scale-95"
          )}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
