"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Video,
  Loader2,
  AlertCircle,
  Download,
  X,
  Clock,
  Calendar,
  Palette,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { VideoDetailResponse } from "@/types/user/ai-task";

interface VideoViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

export default function VideoViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: VideoViewerModalProps) {
  const [data, setData] = useState<VideoDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchVideoDetail = useCallback(async () => {
    if (!notebookId || !aiSetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<VideoDetailResponse>(
        `/user/notebooks/${notebookId}/ai/video/${aiSetId}`
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải video.");
    } finally {
      setLoading(false);
    }
  }, [notebookId, aiSetId]);

  useEffect(() => {
    if (open && aiSetId) {
      fetchVideoDetail();
    }
  }, [open, aiSetId, fetchVideoDetail]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [open, onOpenChange]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFullVideoUrl = (url: string): string => {
    if (url.startsWith("http")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8386";
    return `${baseUrl}${url}`;
  };

  const handleDownload = async () => {
    if (!data?.videoUrl || downloading) return;

    setDownloading(true);
    try {
      const response = await fetch(getFullVideoUrl(data.videoUrl));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.title || "video"}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab if fetch fails
      window.open(getFullVideoUrl(data.videoUrl), "_blank");
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="size-12 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Đang tải video...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="size-12 text-destructive" />
          <p className="text-destructive text-lg">{error}</p>
          <Button variant="outline" onClick={fetchVideoDetail}>
            Thử lại
          </Button>
        </div>
      );
    }

    if (!data) return null;

    return (
      <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Container */}
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              src={getFullVideoUrl(data.videoUrl)}
              className="max-w-full max-h-full"
              controls
              autoPlay={false}
              preload="metadata"
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>

          {/* Keyboard Hints */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Nhấn ESC để đóng
          </p>
        </div>

        {/* Video Info Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-semibold leading-tight">
              {data.title}
            </h2>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Độ dài</p>
                <p className="font-medium">
                  {formatDuration(data.durationSeconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Palette className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phong cách</p>
                <p className="font-medium">{data.style}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="size-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{formatDate(data.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {downloading ? "Đang tải..." : "Tải xuống video"}
            </Button>
          </div>

          {/* Video Info Badge */}
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Video className="size-4 text-primary" />
              <span className="text-sm font-medium">Thông tin video</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Video được tạo tự động bởi AI với hình ảnh minh họa và giọng đọc
              từ nội dung tài liệu của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <Video className="size-5" />
          <span className="font-semibold">Video Player</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <X className="size-5" />
        </Button>
      </div>

      {/* Content - with top padding for header */}
      <div className="pt-14 h-full">{renderContent()}</div>
    </div>
  );
}
