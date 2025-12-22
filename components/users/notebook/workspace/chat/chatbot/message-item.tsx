"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  FileText,
  Sparkles,
  BookOpen,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { ChatMessage } from "@/types/user/chatbot";
import { User } from "@/types/user/user";
import SourcesHorizontal from "./sources-horizontal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface MessageItemProps {
  message: ChatMessage;
  user: User | null;
  copiedId: string | null;
  onCopy: (content: string, messageId: string) => void;
  formatTime: (dateString: string) => string;
}

export default function MessageItem({
  message,
  user,
  copiedId,
  onCopy,
  formatTime,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const isLoading = !isUser && !message.content;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Calculate image files count and determine layout
  const imageFiles =
    isUser && message.files
      ? message.files.filter((file) => file.fileType === "image")
      : [];
  const imageCount = imageFiles.length;

  // Determine grid columns based on image count
  const getGridCols = () => {
    if (imageCount === 1) return "grid-cols-1";
    if (imageCount === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  // Determine image size based on count
  const getImageSize = () => {
    if (imageCount === 1) return "w-48 h-48";
    if (imageCount === 2) return "w-40 h-40";
    return "w-32 h-32";
  };

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2 w-full group",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Images Grid - Above text for user messages */}
        {isUser && imageCount > 0 && (
          <div className={cn("grid gap-2 max-w-[85%]", getGridCols())}>
            {imageFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "relative rounded-lg overflow-hidden border border-primary/20 bg-primary/5 cursor-pointer hover:opacity-90 transition-opacity aspect-square",
                  getImageSize()
                )}
                onClick={() => setSelectedImage(file.fileUrl)}
              >
                <img
                  src={file.fileUrl}
                  alt={file.fileName || "Image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 transition-all",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground   max-w-[85%]"
              : "text-foreground w-full"
          )}
        >
          {isUser ? (
            message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium break-words overflow-wrap-anywhere">
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
            <div className="text-sm leading-relaxed chatbot-markdown-wrapper w-full min-w-0 overflow-x-auto">
              <MarkdownRenderer
                content={message.content}
                className="chatbot-markdown"
              />
            </div>
          )}

          {!isUser && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 right-2 size-8 opacity-0 group-hover:opacity-100 transition-all z-20",
                "bg-background/90 hover:bg-background border border-border/50 rounded-lg ",
                "backdrop-blur-sm"
              )}
              onClick={() => onCopy(message.content, message.id)}
            >
              {copiedId === message.id ? (
                <Check className="size-4 text-primary" />
              ) : (
                <Copy className="size-4 text-foreground" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata: Time, Model, Mode */}
        {!isUser && !isLoading && (
          <div className="flex items-center gap-2 flex-wrap px-1">
            <span className="text-xs text-muted-foreground/80 font-medium">
              {formatTime(message.createdAt)}
            </span>

            {message.model && (
              <Badge
                variant="outline"
                className="text-xs font-medium gap-1.5 px-2.5 py-1 border-border/50 bg-background/80"
              >
                <Sparkles className="size-3" />
                {message.model.code || message.model.provider}
              </Badge>
            )}

            {message.mode && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium gap-1.5 px-2.5 py-1",
                  message.mode === "RAG" &&
                    "border-blue-500/30 bg-blue-500/5 text-blue-600",
                  message.mode === "WEB" &&
                    "border-green-500/30 bg-green-500/5 text-green-600",
                  message.mode === "HYBRID" &&
                    "border-purple-500/30 bg-purple-500/5 text-purple-600",
                  message.mode === "LLM_ONLY" &&
                    "border-orange-500/30 bg-orange-500/5 text-orange-600",
                  message.mode === "AUTO" &&
                    "border-primary/30 bg-primary/5 text-primary"
                )}
              >
                {message.mode === "RAG" && <BookOpen className="size-3" />}
                {message.mode === "WEB" && <Search className="size-3" />}
                {message.mode === "HYBRID" && (
                  <div className="flex items-center gap-0.5">
                    <BookOpen className="size-2.5" />
                    <Search className="size-2.5" />
                  </div>
                )}
                {message.mode === "LLM_ONLY" && <Sparkles className="size-3" />}
                {message.mode === "AUTO" && <Sparkles className="size-3" />}
                {message.mode === "RAG" && "HỎI TÀI LIỆU"}
                {message.mode === "WEB" && "TÌM KIẾM WEB"}
                {message.mode === "HYBRID" && "KẾT HỢP"}
                {message.mode === "LLM_ONLY" && "CHỈ MODEL"}
                {message.mode === "AUTO" && "AUTO"}
              </Badge>
            )}
          </div>
        )}

        {/* Sources Horizontal Scroll */}
        {!isUser &&
          !isLoading &&
          ((message.sources && message.sources.length > 0) ||
            (message.sourceDetails && message.sourceDetails.length > 0)) && (
            <div className="px-1 mt-2 w-full max-w-full overflow-hidden">
              <SourcesHorizontal
                sources={message.sources}
                sourceDetails={message.sourceDetails}
              />
            </div>
          )}
      </div>

      {/* Image Preview Dialog */}
      {isUser && selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogPortal>
            <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
            <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 border-none bg-transparent ">
              <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg "
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-black/95 text-white transition-all z-10  backdrop-blur-sm hover:scale-110"
                  aria-label="Đóng"
                >
                  <X className="size-5" />
                </button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}
