"use client";

import { useState, useCallback, useEffect } from "react";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import VoiceSelector from "./voice-selector";

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

const LANGUAGE_OPTIONS = [
  { id: "vi", label: "Tiếng Việt" },
  { id: "en", label: "English" },
] as const;

interface SummaryGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

export default function SummaryGenerateModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: SummaryGenerateModalProps) {
  // Form state
  const [language, setLanguage] = useState<string>("vi");
  const [enableAudio, setEnableAudio] = useState(false);
  const [voiceId, setVoiceId] = useState<string>("Aoede");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setLanguage("vi");
    setEnableAudio(false);
    setVoiceId("Aoede");
    setAdditionalRequirements("");
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
      toast.error("Vui lòng chọn ít nhất 1 file nguồn để tạo tóm tắt");
      return;
    }

    setStatus("queued");
    setErrorMessage(null);

    try {
      // Tất cả params gửi qua query string theo API spec
      const params = new URLSearchParams();

      // fileIds (bắt buộc)
      selectedFileIds.forEach((id) => params.append("fileIds", id));

      // language (optional, default: vi)
      if (language) {
        params.append("language", language);
      }

      // voiceId (optional - nếu có sẽ tạo audio TTS)
      if (enableAudio && voiceId) {
        params.append("voiceId", voiceId);
      }

      // additionalRequirements (optional)
      if (additionalRequirements.trim()) {
        params.append("additionalRequirements", additionalRequirements.trim());
      }

      await api.post(
        `/user/notebooks/${notebookId}/ai/summary/generate?${params.toString()}`
      );

      toast.success("Đang tạo bản tóm tắt. Sẽ xuất hiện khi hoàn thành.");
      onSuccess?.();
      resetState();
    } catch (err: unknown) {
      const resp = (
        err as { response?: { data?: { error?: string; message?: string } } }
      ).response;
      setStatus("failed");
      setErrorMessage(
        resp?.data?.error ||
          resp?.data?.message ||
          "Không thể tạo bản tóm tắt. Vui lòng thử lại."
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
            <FileText className="size-5" />
            Tóm tắt nội dung
          </DialogTitle>
          <DialogDescription>
            Tạo bản tóm tắt chi tiết từ tài liệu, hỗ trợ audio đọc.
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
                file để tóm tắt.
              </p>
            </div>
          )}

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Ngôn ngữ</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isProcessing}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enable Audio Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="enable-audio">Tạo Audio đọc</Label>
              <p className="text-xs text-muted-foreground">
                Tạo file audio từ nội dung tóm tắt
              </p>
            </div>
            <Switch
              id="enable-audio"
              checked={enableAudio}
              onCheckedChange={setEnableAudio}
              disabled={isProcessing}
            />
          </div>

          {/* Voice Selection (only show when audio enabled) */}
          {enableAudio && (
            <VoiceSelector
              value={voiceId}
              onValueChange={setVoiceId}
              disabled={isProcessing}
            />
          )}

          {/* Additional Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Yêu cầu bổ sung (tuỳ chọn)</Label>
            <Textarea
              id="requirements"
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Ví dụ: Tập trung vào phần công thức toán học, giải thích đơn giản hơn..."
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
              "Tạo tóm tắt"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
