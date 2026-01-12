"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Clock, AlertCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { GenerateTimelineResponse } from "@/types/user/ai-task";

interface TimelineGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

type TimelineMode = "time" | "logic";
type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

const MODE_OPTIONS: { value: TimelineMode; label: string; description: string }[] =
  [
    {
      value: "time",
      label: "Theo thời gian",
      description: "Sắp xếp các sự kiện theo thứ tự thời gian",
    },
    {
      value: "logic",
      label: "Theo logic",
      description: "Sắp xếp các sự kiện theo mối quan hệ logic",
    },
  ];

export default function TimelineGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: TimelineGenerateModalProps) {
  const [mode, setMode] = useState<TimelineMode>("logic");
  const [maxEvents, setMaxEvents] = useState<number>(25);
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
    setAdditionalRequirements("");
    setMode("logic");
    setMaxEvents(25);
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

    if (maxEvents < 5 || maxEvents > 100) {
      toast.error("Số sự kiện phải từ 5 đến 100");
      return;
    }

    setStatus("queued");
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      selectedFileIds.forEach((id) => params.append("fileIds", id));
      params.append("mode", mode);
      params.append("maxEvents", maxEvents.toString());
      if (additionalRequirements.trim()) {
        params.append("additionalRequirements", additionalRequirements.trim());
      }

      const response = await api.post<GenerateTimelineResponse>(
        `/user/notebooks/${notebookId}/ai/timeline/generate?${params.toString()}`
      );

      // Subscribe to task progress if aiSetId is available
      if (response.data?.aiSetId && (window as any).__aiTaskWebSocket) {
        (window as any).__aiTaskWebSocket.subscribe(response.data.aiSetId);
      }

      // API 200 - đóng modal và thông báo
      toast.success(
        "Đang tạo Timeline. Bạn sẽ nhận được thông báo khi hoàn thành."
      );
      onSuccess?.();
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setStatus("failed");
      setErrorMessage(
        err.response?.data?.error || "Không thể tạo timeline. Vui lòng thử lại."
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
            <Clock className="size-5" />
            Tạo Timeline với AI
          </DialogTitle>
          <DialogDescription>
            Tạo dòng thời gian các sự kiện từ {selectedFileIds.length} file đã
            chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Count Info */}
          {selectedFileIds.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">
                Vui lòng chọn file từ panel Nguồn trước khi tạo timeline
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Đã chọn{" "}
                <span className="font-medium">{selectedFileIds.length}</span>{" "}
                file để tạo timeline
              </p>
            </div>
          )}

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Chế độ sắp xếp</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as TimelineMode)} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Events */}
          <div className="space-y-2">
            <Label>Số sự kiện tối đa</Label>
            <Input
              type="number"
              min={5}
              max={100}
              value={maxEvents}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 5 && val <= 100) {
                  setMaxEvents(val);
                }
              }}
              disabled={isProcessing}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Từ 5 đến 100 sự kiện
            </p>
          </div>

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label>Yêu cầu bổ sung (tùy chọn)</Label>
            <Textarea
              placeholder="Ví dụ: Tập trung vào các mốc quan trọng, bao gồm cả bối cảnh lịch sử..."
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              disabled={isProcessing}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="size-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button onClick={handleGenerate} disabled={!canSubmit}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo Timeline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

