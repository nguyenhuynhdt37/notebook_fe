"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
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
        <div className="border-t bg-background p-4 space-y-2">
            {replyToMessage && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                            Trả lời {replyToMessage.userName}
                        </div>
                        <div className="text-muted-foreground line-clamp-1">
                            {replyToMessage.content}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onCancelReply}
                        className="shrink-0"
                    >
                        ×
                    </Button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border bg-background px-3 py-2 text-sm",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
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
    );
}

