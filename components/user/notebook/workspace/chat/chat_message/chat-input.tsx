"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 3000);
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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="border-t p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Reply preview */}
        {replyToMessage && (
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Reply className="size-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">
                Trả lời {replyToMessage.userName}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {replyToMessage.content}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancelReply}>
              <X className="size-4" />
            </Button>
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 min-h-[44px] max-h-[120px] resize-none",
              "focus-visible:ring-1"
            )}
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            size="icon"
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
