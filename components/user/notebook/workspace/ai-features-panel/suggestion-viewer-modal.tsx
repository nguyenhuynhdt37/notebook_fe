"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Loader2, AlertCircle, Send, X } from "lucide-react";
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
} from "@/components/ui/dialog";

interface SuggestionViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

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

  const handleSelectSuggestion = (suggestion: string) => {
    // Dispatch event to ChatInput
    window.dispatchEvent(
      new CustomEvent("chatbot:set-input", { detail: suggestion })
    );

    // Close modal and show info
    onOpenChange(false);
    toast.message("Đã chuyển câu hỏi vào chatbot", {
      description: "Nhấn Gửi để bắt đầu thảo luận",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Câu hỏi gợi ý thảo luận
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Đang tải câu hỏi...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={fetchSuggestions}>
                Thử lại
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {data?.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group relative"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <p className="text-sm leading-relaxed pr-8">{suggestion}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Send className="size-3" />
                    </Button>
                  </div>
                ))}

                {data?.suggestions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Không có câu hỏi nào.
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
