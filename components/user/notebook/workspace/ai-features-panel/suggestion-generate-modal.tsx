"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GenerateSuggestionResponse } from "@/types/user/ai-task";

interface SuggestionGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

export default function SuggestionGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: SuggestionGenerateModalProps) {
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    setAdditionalRequirements("");
  }, []);

  const handleClose = useCallback(() => {
    if (status === "queued") {
      return; // Không cho đóng khi đang gửi request
    }
    resetState();
    onOpenChange(false);
  }, [status, resetState, onOpenChange]);

  const handleGenerate = async () => {
    if (selectedFileIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file từ danh sách nguồn");
      return;
    }

    setStatus("queued");
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      selectedFileIds.forEach((id) => params.append("fileIds", id));
      if (additionalRequirements.trim()) {
        params.append("additionalRequirements", additionalRequirements.trim());
      }

      await api.post<GenerateSuggestionResponse>(
        `/user/notebooks/${notebookId}/ai/suggestions/generate?${params.toString()}`
      );

      // API 200 - đóng modal và thông báo
      toast.success(
        "Đang tạo câu hỏi thảo luận. Bạn sẽ nhận được thông báo khi hoàn thành."
      );
      onSuccess?.();
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(
        err.response?.data?.error ||
          "Không thể tạo câu hỏi thảo luận. Vui lòng thử lại."
      );
    }
  };

  // Reset state khi mở modal
  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  const isProcessing = status === "queued" || status === "processing";
  const canSubmit = selectedFileIds.length > 0 && !isProcessing;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Tạo câu hỏi gợi ý thảo luận
          </DialogTitle>
          <DialogDescription>
            AI sẽ tạo danh sách các câu hỏi gợi mở, chủ đề thảo luận sâu sắc dựa
            trên {selectedFileIds.length} tài liệu đã chọn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Count Info */}
          {selectedFileIds.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">
                Vui lòng chọn file từ panel Nguồn trước khi tạo
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Đã chọn{" "}
                <span className="font-medium">{selectedFileIds.length}</span>{" "}
                file để phân tích
              </p>
            </div>
          )}

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label>Yêu cầu bổ sung (tùy chọn)</Label>
            <Textarea
              placeholder="Ví dụ: Tập trung vào các khía cạnh đạo đức, so sánh với..."
              value={additionalRequirements}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAdditionalRequirements(e.target.value)
              }
              disabled={isProcessing}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Status Message */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Loader2 className="size-4 animate-spin" />
              <p className="text-sm text-muted-foreground">
                {status === "queued" && "Đang chờ xử lý..."}
                {status === "processing" && "AI đang phân tích..."}
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-foreground">
              <span>✅</span>
              <p className="text-sm font-medium">Đã tạo xong câu hỏi!</p>
            </div>
          )}

          {status === "failed" && errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {isProcessing ? "Đang xử lý..." : "Hủy"}
          </Button>
          <Button onClick={handleGenerate} disabled={!canSubmit}>
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Đang tạo...
              </>
            ) : (
              "Tạo câu hỏi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
