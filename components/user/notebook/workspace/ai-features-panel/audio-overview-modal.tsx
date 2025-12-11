"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Mic,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

interface AudioAsset {
  id: string;
  setType: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
  outputStats: {
    audioUrl?: string;
    voiceName?: string;
  } | null;
  errorMessage: string | null;
}

interface AudioOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  selectedFileIds: string[];
  onSuccess?: () => void;
}

export default function AudioOverviewModal({
  open,
  onOpenChange,
  notebookId,
  selectedFileIds,
  onSuccess,
}: AudioOverviewModalProps) {
  const [voiceId, setVoiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio list state
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // Load audio assets when modal opens
  useEffect(() => {
    if (open) {
      loadAudioAssets();
    }
    return () => {
      // Stop audio when modal closes
      if (audioElement) {
        audioElement.pause();
        setPlayingId(null);
      }
    };
  }, [open]);

  const loadAudioAssets = async () => {
    try {
      setLoadingAssets(true);
      const response = await api.get<AudioAsset[]>(
        `/user/notebooks/${notebookId}/ai/sets?setType=tts`
      );
      setAudioAssets(response.data);
    } catch (err) {
      console.error("Error loading audio assets:", err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const resetState = useCallback(() => {
    setVoiceId("");
    setNotes("");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const handleClose = useCallback(() => {
    if (status === "queued") return;
    if (audioElement) {
      audioElement.pause();
      setPlayingId(null);
    }
    resetState();
    onOpenChange(false);
  }, [status, resetState, onOpenChange, audioElement]);

  const handleGenerate = async () => {
    if (selectedFileIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file nguồn để tạo overview");
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
      resetState();
      // Reload audio assets
      loadAudioAssets();
    } catch (err: unknown) {
      const resp = (
        err as { response?: { data?: { error?: string; message?: string } } }
      ).response;
      setStatus("failed");
      setErrorMessage(
        resp?.data?.error ||
        resp?.data?.message ||
        "Không thể tạo Audio Overview. Vui lòng thử lại."
      );
    }
  };

  const handlePlayPause = (asset: AudioAsset) => {
    const audioUrl = asset.outputStats?.audioUrl;
    if (!audioUrl) {
      toast.error("Không tìm thấy audio URL");
      return;
    }

    if (playingId === asset.id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
      return;
    }

    // Stop current audio
    if (audioElement) {
      audioElement.pause();
    }

    // Create new audio and play
    const fullUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${window.location.origin}${audioUrl}`;
    const audio = new Audio(fullUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    setAudioElement(audio);
    setPlayingId(asset.id);
  };

  const handleDelete = async (aiSetId: string) => {
    if (!confirm("Bạn có chắc muốn xóa audio này?")) return;

    try {
      await api.delete(`/user/notebooks/${notebookId}/ai/sets/${aiSetId}`);
      toast.success("Đã xóa audio");
      loadAudioAssets();
    } catch {
      toast.error("Không thể xóa audio");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="size-4 text-green-500" />;
      case "processing":
      case "pending":
        return <Clock className="size-4 text-yellow-500 animate-pulse" />;
      case "failed":
        return <XCircle className="size-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isProcessing = status === "queued" || status === "processing";
  const canSubmit = selectedFileIds.length > 0 && !isProcessing;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="size-5" />
            Audio Podcast
          </DialogTitle>
          <DialogDescription>
            Tạo podcast hội thoại giữa Host và Expert từ tài liệu.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              Danh sách ({audioAssets.length})
            </TabsTrigger>
            <TabsTrigger value="create">Tạo mới</TabsTrigger>
          </TabsList>

          {/* Tab: Danh sách audio đã tạo */}
          <TabsContent value="list" className="mt-4">
            {loadingAssets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : audioAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có podcast nào được tạo.</p>
                <p className="text-xs">
                  Chuyển sang tab &quot;Tạo mới&quot; để bắt đầu.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {audioAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
                        playingId === asset.id && "ring-2 ring-primary"
                      )}
                    >
                      {/* Play button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        disabled={asset.status !== "done"}
                        onClick={() => handlePlayPause(asset)}
                      >
                        {playingId === asset.id ? (
                          <Pause className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(asset.status)}
                          <span className="text-sm font-medium truncate">
                            {asset.status === "done"
                              ? "Podcast"
                              : asset.status === "processing"
                                ? "Đang xử lý..."
                                : asset.status === "pending" || asset.status === "queued"
                                  ? "Đang chờ..."
                                  : "Lỗi"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(asset.createdAt)}
                          {asset.outputStats?.voiceName &&
                            ` • ${asset.outputStats.voiceName}`}
                        </p>
                        {asset.errorMessage && (
                          <p className="text-xs text-red-500 truncate">
                            {asset.errorMessage}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {asset.status === "done" &&
                          asset.outputStats?.audioUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                window.open(
                                  asset.outputStats?.audioUrl,
                                  "_blank"
                                )
                              }
                              title="Mở trong tab mới"
                            >
                              <ExternalLink className="size-4" />
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => loadAudioAssets()}>
                Làm mới
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Tạo mới */}
          <TabsContent value="create" className="mt-4">
            <div className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="voiceId">Giọng Expert (Gemini TTS)</Label>
                <Input
                  id="voiceId"
                  placeholder='Để trống dùng "Kore" (mặc định)'
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  Voices: Kore, Sage, Vale, Charon, Fenrir, Aoede, Leda, Orus, Zephyr...
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Host:</strong> Puck (tự động) • <strong>Expert:</strong> {voiceId || "Kore"}
                </p>
              </div>

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

            <DialogFooter className="gap-2 mt-4">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
