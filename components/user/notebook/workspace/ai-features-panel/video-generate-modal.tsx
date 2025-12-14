"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Video, AlertCircle, Clock } from "lucide-react";
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
import { GenerateVideoResponse, VideoLength } from "@/types/user/ai-task";

interface VideoGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

const VIDEO_LENGTH_OPTIONS: {
  value: VideoLength;
  label: string;
  description: string;
  slides: number;
  time: string;
}[] = [
  {
    value: "short",
    label: "Ngắn",
    description: "5 slides",
    slides: 5,
    time: "~2-3 phút",
  },
  {
    value: "medium",
    label: "Vừa",
    description: "10 slides",
    slides: 10,
    time: "~4-5 phút",
  },
  {
    value: "long",
    label: "Dài",
    description: "15 slides",
    slides: 15,
    time: "~7-8 phút",
  },
];

export default function VideoGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: VideoGenerateModalProps) {
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [videoLength, setVideoLength] = useState<VideoLength>("medium");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    setAdditionalRequirements("");
    setVideoLength("medium");
  }, []);

  const handleClose = useCallback(() => {
    if (status === "queued") {
      return;
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
      params.append("videoLength", videoLength);
      if (additionalRequirements.trim()) {
        params.append("additionalRequirements", additionalRequirements.trim());
      }

      await api.post<GenerateVideoResponse>(
        `/user/notebooks/${notebookId}/ai/video/generate?${params.toString()}`
      );

      toast.success(
        "Đang tạo video. Quá trình có thể mất 10-20 phút tùy độ dài."
      );
      onSuccess?.();
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(
        err.response?.data?.error || "Không thể tạo video. Vui lòng thử lại."
      );
    }
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  const isProcessing = status === "queued" || status === "processing";
  const canSubmit = selectedFileIds.length > 0 && !isProcessing;

  const selectedOption = VIDEO_LENGTH_OPTIONS.find(
    (opt) => opt.value === videoLength
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Tạo Video với AI
          </DialogTitle>
          <DialogDescription>
            AI sẽ tạo video tự động với hình ảnh minh họa và giọng đọc từ{" "}
            {selectedFileIds.length} file đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Count Info */}
          {selectedFileIds.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">
                Vui lòng chọn file từ panel Nguồn trước khi tạo video
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Đã chọn{" "}
                <span className="font-medium">{selectedFileIds.length}</span>{" "}
                file để tạo video
              </p>
            </div>
          )}

          {/* Video Length Selector */}
          <div className="space-y-2">
            <Label>Độ dài video</Label>
            <div className="grid grid-cols-3 gap-2">
              {VIDEO_LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVideoLength(opt.value)}
                  disabled={isProcessing}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    videoLength === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {opt.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {opt.time}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
            <Clock className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Thời gian xử lý ước tính:{" "}
              <span className="font-medium">
                {videoLength === "short"
                  ? "5-8 phút"
                  : videoLength === "medium"
                  ? "10-15 phút"
                  : "15-20 phút"}
              </span>
            </p>
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label>Yêu cầu bổ sung (tùy chọn)</Label>
            <Textarea
              placeholder="Ví dụ: Tập trung vào phần giới thiệu, sử dụng phong cách chuyên nghiệp..."
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
                {status === "queued" && "Đang gửi yêu cầu..."}
                {status === "processing" && "AI đang xử lý video..."}
              </p>
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
              "Tạo Video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
