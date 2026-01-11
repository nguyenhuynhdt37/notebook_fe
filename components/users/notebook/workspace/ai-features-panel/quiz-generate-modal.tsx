"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ListChecks, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerateQuizResponse } from "@/types/user/ai-task";

interface QuizGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

type NumberOfQuestions = "few" | "standard" | "many";
type DifficultyLevel = "easy" | "medium" | "hard";
type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

const NUMBER_OPTIONS: { value: NumberOfQuestions; label: string }[] = [
  { value: "few", label: "Ít (3-5 câu)" },
  { value: "standard", label: "Tiêu chuẩn (5-10 câu)" },
  { value: "many", label: "Nhiều (10-15 câu)" },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

export default function QuizGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: QuizGenerateModalProps) {
  const [numberOfQuestions, setNumberOfQuestions] =
    useState<NumberOfQuestions>("standard");
  const [difficultyLevel, setDifficultyLevel] =
    useState<DifficultyLevel>("medium");
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
      params.append("numberOfQuestions", numberOfQuestions);
      params.append("difficultyLevel", difficultyLevel);
      if (additionalRequirements.trim()) {
        params.append("additionalRequirements", additionalRequirements.trim());
      }

      const response = await api.post<GenerateQuizResponse>(
        `/user/notebooks/${notebookId}/ai/quiz/generate?${params.toString()}`
      );

      // Subscribe to task progress if aiSetId is available
      if (response.data?.aiSetId && (window as any).__aiTaskWebSocket) {
        (window as any).__aiTaskWebSocket.subscribe(response.data.aiSetId);
      }

      // API 200 - đóng modal và thông báo
      toast.success(
        "Đang tạo Quiz. Bạn sẽ nhận được thông báo khi hoàn thành."
      );
      onSuccess?.();
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(
        err.response?.data?.error || "Không thể tạo quiz. Vui lòng thử lại."
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
            <ListChecks className="size-5" />
            Tạo Quiz với AI
          </DialogTitle>
          <DialogDescription>
            Tạo bài kiểm tra trắc nghiệm từ {selectedFileIds.length} file đã
            chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Count Info */}
          {selectedFileIds.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">
                Vui lòng chọn file từ panel Nguồn trước khi tạo quiz
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Đã chọn{" "}
                <span className="font-medium">{selectedFileIds.length}</span>{" "}
                file để tạo quiz
              </p>
            </div>
          )}

          {/* Number of Questions */}
          <div className="space-y-2">
            <Label>Số lượng câu hỏi</Label>
            <Select
              value={numberOfQuestions}
              onValueChange={(v) =>
                setNumberOfQuestions(v as NumberOfQuestions)
              }
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label>Độ khó</Label>
            <Select
              value={difficultyLevel}
              onValueChange={(v) => setDifficultyLevel(v as DifficultyLevel)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label>Yêu cầu bổ sung (tùy chọn)</Label>
            <Textarea
              placeholder="Ví dụ: Tập trung vào chương 3, hoặc câu hỏi về toán học..."
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
                {status === "processing" && "AI đang tạo quiz..."}
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-foreground">
              <span>✅</span>
              <p className="text-sm font-medium">Quiz đã được tạo!</p>
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
              "Tạo Quiz"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
