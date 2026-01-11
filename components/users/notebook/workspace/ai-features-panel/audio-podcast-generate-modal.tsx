"use client";

import { useState, useCallback } from "react";
import { Mic, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import VoiceSelector from "./voice-selector";

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

interface AudioPodcastGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

export default function AudioPodcastGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: AudioPodcastGenerateModalProps) {
  const [voiceId, setVoiceId] = useState("Kore");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setVoiceId("Kore");
    setNotes("");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    if (status === "queued") return;
    resetState();
    onOpenChange(false);
  }, [status, resetState, onOpenChange]);

  const handleGenerate = async () => {
    if (selectedFileIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file nguồn để tạo podcast");
      return;
    }

    setStatus("queued");
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      selectedFileIds.forEach((id) => params.append("fileIds", id));
      if (voiceId.trim()) params.append("voiceId", voiceId.trim());

      const body = notes.trim() ? { notes: notes.trim() } : undefined;

      await api.post(
        `/user/notebooks/${notebookId}/ai/audio-overview/generate-async?${params.toString()}`,
        body
      );

      toast.success("Đang tạo Podcast. Sẽ xuất hiện khi hoàn thành.");
      onSuccess?.();
      onOpenChange(false);
      resetState();
    } catch (err: unknown) {
      const resp = (
        err as { response?: { data?: { error?: string; message?: string } } }
      ).response;
      setStatus("failed");
      setErrorMessage(
        resp?.data?.error ||
          resp?.data?.message ||
          "Không thể tạo Audio Podcast. Vui lòng thử lại."
      );
    }
  };

  const isProcessing = status === "queued" || status === "processing";
  const canSubmit = selectedFileIds.length > 0 && !isProcessing;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="size-5" />
            Tạo Audio Podcast
          </DialogTitle>
          <DialogDescription>
            Tạo podcast hội thoại giữa Host và Expert từ tài liệu của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File info */}
          {selectedFileIds.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">Vui lòng chọn file từ panel Nguồn.</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Đã chọn{" "}
                <span className="font-medium">{selectedFileIds.length}</span>{" "}
                file để tạo podcast.
              </p>
            </div>
          )}

          {/* Voice cho Expert */}
          <VoiceSelector
            value={voiceId}
            onValueChange={setVoiceId}
            disabled={isProcessing}
            label="Giọng Expert (Gemini TTS)"
          />
          <p className="text-xs text-muted-foreground">
            <strong>Host:</strong> Puck (tự động) • <strong>Expert:</strong>{" "}
            {voiceId || "Kore"}
          </p>

          {/* Optional notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Yêu cầu bổ sung (tuỳ chọn)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Tập trung vào phần lý thuyết, nói chậm hơn..."
              disabled={isProcessing}
              rows={2}
            />
          </div>

          {/* Error box */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
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
                <Loader2 className="size-4 animate-spin mr-2" />
                Đang gửi
              </>
            ) : (
              "Tạo podcast"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
