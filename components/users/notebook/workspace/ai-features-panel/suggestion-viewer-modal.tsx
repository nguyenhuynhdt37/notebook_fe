"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  Send,
  Lightbulb,
  BookOpen,
  Brain,
  Target,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiSuggestionResponse } from "@/types/user/ai-task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SuggestionViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  evaluation: {
    label: "Đánh giá",
    icon: Target,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  analysis: {
    label: "Phân tích",
    icon: Brain,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  application: {
    label: "Ứng dụng",
    icon: Sparkles,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  comprehension: {
    label: "Hiểu biết",
    icon: BookOpen,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
};

export default function SuggestionViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: SuggestionViewerModalProps) {
  const [data, setData] = useState<AiSuggestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!notebookId || !aiSetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<AiSuggestionResponse>(
        `/user/notebooks/${notebookId}/ai/suggestions/${aiSetId}`
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải câu hỏi mở rộng.");
    } finally {
      setLoading(false);
    }
  }, [notebookId, aiSetId]);

  useEffect(() => {
    if (open && aiSetId) {
      fetchSuggestions();
    }
  }, [open, aiSetId, fetchSuggestions]);

  const handleSelectSuggestion = (question: string) => {
    window.dispatchEvent(
      new CustomEvent("chatbot:set-input", { detail: question })
    );

    onOpenChange(false);
    toast.message("Đã chuyển câu hỏi vào chatbot", {
      description: "Nhấn Gửi để bắt đầu thảo luận",
    });
  };

  const getCategoryConfig = (category: string) => {
    return (
      CATEGORY_CONFIG[category] || {
        label: category,
        icon: MessageSquare,
        className: "bg-muted text-muted-foreground",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="size-5 text-primary" />
            </div>
            Câu hỏi gợi ý thảo luận
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Click vào câu hỏi để gửi đến chatbot AI
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <Loader2 className="size-10 animate-spin text-primary relative" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Đang tải câu hỏi...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="size-8 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSuggestions}>
                Thử lại
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[450px] -mx-2 px-2">
              <div className="space-y-3">
                {data?.suggestions.map((suggestion, index) => {
                  const config = getCategoryConfig(suggestion.category);
                  const CategoryIcon = config.icon;

                  return (
                    <div
                      key={index}
                      className="group relative p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() =>
                        handleSelectSuggestion(suggestion.question)
                      }
                    >
                      {/* Category badge */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                            config.className
                          )}
                        >
                          <CategoryIcon className="size-3.5" />
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Question */}
                      <p className="text-sm leading-relaxed font-medium pr-8">
                        {suggestion.question}
                      </p>

                      {/* Hint */}
                      {suggestion.hint && (
                        <div className="flex items-start gap-2 mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {suggestion.hint}
                          </p>
                        </div>
                      )}

                      {/* Send button */}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-8 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  );
                })}

                {data?.suggestions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="size-12 mb-4 opacity-20" />
                    <p className="text-sm">Không có câu hỏi nào.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
