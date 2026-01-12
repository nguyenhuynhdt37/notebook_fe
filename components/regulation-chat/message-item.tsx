"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader2, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { ChatMessage } from "@/types/user/regulation-chat";
import SourcesHorizontal from "./sources-horizontal";

interface MessageItemProps {
  message: ChatMessage;
  copiedId: string | null;
  onCopy: (content: string, messageId: string) => void;
  formatTime: (dateString: string) => string;
}

export default function MessageItem({
  message,
  copiedId,
  onCopy,
  formatTime,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const isLoading = !isUser && !message.content;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Typing effect state
  const [displayedContent, setDisplayedContent] = useState(
    message.isTyping ? "" : message.content
  );

  useEffect(() => {
    if (message.isTyping && message.content) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedContent((prev) => message.content.substring(0, index + 1));
        index++;
        if (index > message.content.length) {
          clearInterval(interval);
        }
      }, 10); // Adjust speed here (10ms per char)
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.isTyping]);

  // Image count for layout
  const imageCount = message.images?.length || 0;

  // Helper to get full image URL
  const getImageUrl = (fileUrl: string) => {
    // If fileUrl is already a full URL, use it directly
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    // Otherwise, prepend backend URL
    return `${process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386"}${fileUrl}`;
  };

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 w-full group",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Images Grid - Above text for user messages */}
        {isUser && imageCount > 0 && (
          <div
            className={cn(
              "grid gap-2 max-w-[85%]",
              imageCount === 1 && "grid-cols-1",
              imageCount === 2 && "grid-cols-2",
              imageCount >= 3 && "grid-cols-3"
            )}
          >
            {message.images?.map((img) => (
              <div
                key={img.id}
                className={cn(
                  "relative rounded-lg overflow-hidden border border-primary/20 bg-primary/5 cursor-pointer hover:opacity-90 transition-opacity aspect-square",
                  imageCount === 1 && "w-48 h-48",
                  imageCount === 2 && "w-40 h-40",
                  imageCount >= 3 && "w-32 h-32"
                )}
                onClick={() => setSelectedImage(getImageUrl(img.fileUrl))}
              >
                <img
                  src={getImageUrl(img.fileUrl)}
                  alt={img.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 transition-all",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground max-w-[85%]"
              : "text-foreground w-full"
          )}
        >
          {isUser ? (
            message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                {message.content}
              </p>
            )
          ) : isLoading ? (
            <div className="flex items-center gap-2 py-1">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Đang suy nghĩ...
              </span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed w-full min-w-0">
              <MarkdownRenderer content={displayedContent} />
              {message.isTyping &&
                displayedContent.length < message.content.length && (
                  <span className="inline-block w-2 H-4 bg-primary/50 ml-1 animate-pulse" />
                )}
            </div>
          )}

          {/* Copy Button */}
          {!isUser && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-all",
                "bg-background/90 hover:bg-background border border-border/50 rounded-lg backdrop-blur-sm"
              )}
              onClick={() => onCopy(message.content, message.id)}
            >
              {copiedId === message.id ? (
                <Check className="size-4 text-primary" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata: Time & Mode */}
        {!isUser && !isLoading && (
          <div className="flex items-center gap-2 flex-wrap px-1">
            <span className="text-xs text-muted-foreground/80">
              {formatTime(message.timestamp.toISOString())}
            </span>

            {message.sources && message.sources.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-medium gap-1.5 px-2.5 py-1 border-blue-500/30 bg-blue-500/5 text-blue-600"
              >
                <BookOpen className="size-3" />
                {message.sources.length} nguồn
              </Badge>
            )}
          </div>
        )}

        {/* Sources */}
        {!isUser &&
          !isLoading &&
          message.sources &&
          message.sources.length > 0 && (
            <div className="w-full px-1 mt-2">
              <SourcesHorizontal sources={message.sources} />
            </div>
          )}
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl w-auto p-0 bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-10 right-0 size-8 rounded-full bg-background/90 hover:bg-background"
              onClick={() => setSelectedImage(null)}
            >
              <X className="size-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
