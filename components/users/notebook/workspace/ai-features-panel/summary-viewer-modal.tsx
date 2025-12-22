"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  X,
  Clock,
  Calendar,
  Languages,
  Volume2,
  Play,
  Pause,
  Download,
  Mic2,
  VolumeX,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { SummaryDetailResponse } from "@/types/user/ai-task";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

// Helper functions
const formatTime = (ms: number) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Info card component
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
    <Icon className="size-4 text-muted-foreground shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default function SummaryViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: Props) {
  const [data, setData] = useState<SummaryDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!notebookId || !aiSetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<SummaryDetailResponse>(
        `/user/notebooks/${notebookId}/ai/summary/${aiSetId}`
      );
      setData(res.data);
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { error?: string; message?: string } } }
      ).response?.data;
      setError(msg?.error || msg?.message || "Không thể tải bản tóm tắt.");
    } finally {
      setLoading(false);
    }
  }, [notebookId, aiSetId]);

  // Reset on close, fetch on open
  useEffect(() => {
    if (open && aiSetId) fetchData();
    if (!open) {
      setData(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [open, aiSetId, fetchData]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === " " && data?.hasAudio) {
        e.preventDefault();
        togglePlay();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, data?.hasAudio]);

  // Audio controls
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play().catch(() => {});
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (v: number[]) => {
    setIsSeeking(true);
    setCurrentTime(v[0]); // Preview only
  };

  const commitSeek = (v: number[]) => {
    setIsSeeking(false);
    if (audioRef.current) {
      audioRef.current.currentTime = v[0] / 1000;
    }
  };

  const handleVolumeChange = (v: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v[0];
    setVolume(v[0]);
    setIsMuted(v[0] === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const downloadAudio = async () => {
    if (!data?.audioUrl) return;
    try {
      const blob = await fetch(data.audioUrl).then((r) => r.blob());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "summary"}.${data.audioFormat || "wav"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(data.audioUrl, "_blank");
    }
  };

  if (!open) return null;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải bản tóm tắt...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="size-12 text-destructive mx-auto" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const audioDuration = data.audioDurationMs || duration;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <FileText className="size-5" />
          <span className="font-semibold">Xem bản tóm tắt</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <X className="size-5" />
        </Button>
      </header>

      {/* Hidden Audio */}
      {data.hasAudio && data.audioUrl && (
        <audio
          ref={audioRef}
          src={data.audioUrl}
          onTimeUpdate={() => {
            if (!isSeeking) {
              setCurrentTime((audioRef.current?.currentTime || 0) * 1000);
            }
          }}
          onLoadedMetadata={() =>
            setDuration((audioRef.current?.duration || 0) * 1000)
          }
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Content */}
      <div className="pt-14 h-full flex flex-col lg:flex-row justify-center gap-8 px-6 lg:px-16 py-6">
        {/* Markdown */}
        <div className="flex-1 min-w-0 max-w-4xl h-full overflow-y-auto pr-4">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <MarkdownRenderer content={data.contentMd} />
          </article>
          <p className="text-xs text-muted-foreground mt-6 pb-4 text-center">
            ESC để đóng{data.hasAudio && " • Space phát/dừng"}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Title Card */}
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg">
              <h2 className="text-lg font-semibold mb-3">{data.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                  {data.language === "vi" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}
                </span>
                {data.voiceLabel && (
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                    🎙️ {data.voiceLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Audio Player */}
            {data.hasAudio && data.audioUrl && (
              <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden">
                {/* 1. Slider Row (Full Width) */}
                <div className="px-3 pt-4">
                  <Slider
                    value={[currentTime]}
                    max={audioDuration || 1}
                    step={100}
                    onValueChange={handleSeek}
                    onValueCommit={commitSeek}
                    className="w-full"
                  />
                </div>

                {/* 2. Controls Row */}
                <div className="flex items-center gap-2 px-3 py-3">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4 ml-0.5" />
                    )}
                  </Button>

                  {/* Time info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <Mic2 className="size-3 text-muted-foreground" />
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {data.voiceLabel || "AI Voice"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatTime(currentTime)} / {formatTime(audioDuration)}
                    </span>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="size-3.5" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-16 hidden sm:flex"
                    />
                  </div>

                  {/* Download */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={downloadAudio}
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg space-y-3">
              <InfoRow
                icon={Languages}
                label="Ngôn ngữ"
                value={data.language === "vi" ? "Tiếng Việt" : "English"}
              />
              {data.hasAudio && audioDuration > 0 && (
                <InfoRow
                  icon={Clock}
                  label="Độ dài"
                  value={`${Math.floor(audioDuration / 1000)} giây`}
                />
              )}
              <InfoRow
                icon={Calendar}
                label="Ngày tạo"
                value={formatDate(data.createdAt)}
              />

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-3" />
                  <span className="font-medium">Thông tin</span>
                </div>
                <p className="leading-relaxed">
                  Tóm tắt tự động bởi AI.{data.hasAudio && " Audio bằng TTS."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
