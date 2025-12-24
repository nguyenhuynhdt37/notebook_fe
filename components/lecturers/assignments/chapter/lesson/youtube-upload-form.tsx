"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Youtube, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/api/client/axios";
import {
  ChapterItem,
  ChapterYoutubeUploadRequest,
} from "@/types/lecturer/chapter";

interface YoutubeUploadFormProps {
  chapterId: string;
  onBack: () => void;
  onSuccess: () => void;
}

/**
 * Trích xuất video ID từ URL YouTube
 * Hỗ trợ các format: youtu.be/xxx, youtube.com/watch?v=xxx, youtube.com/embed/xxx
 */
function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YoutubeUploadForm({
  chapterId,
  onBack,
  onSuccess,
}: YoutubeUploadFormProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoId = extractYoutubeVideoId(youtubeUrl);
  const isValidUrl = !!videoId;

  const handleSubmit = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Vui lòng nhập URL video YouTube");
      return;
    }

    if (!isValidUrl) {
      toast.error("URL YouTube không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      const body: ChapterYoutubeUploadRequest = {
        youtubeUrl: youtubeUrl.trim(),
        ...(title.trim() && { title: title.trim() }),
        ...(description.trim() && { description: description.trim() }),
      };

      await api.post<ChapterItem>(
        `/lecturer/chapters/${chapterId}/items/youtube`,
        body
      );

      toast.success("Đã thêm video YouTube!");
      onSuccess();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể thêm video YouTube";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Youtube className="size-5 text-red-500" />
            Thêm video YouTube
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* YouTube URL Input */}
        <div className="space-y-1.5">
          <Label htmlFor="youtube-url">
            URL Video YouTube <span className="text-red-500">*</span>
          </Label>
          <Input
            id="youtube-url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/kOiZpMpBpAU"
            disabled={isSubmitting}
          />
          {youtubeUrl && !isValidUrl && (
            <p className="text-xs text-red-500">
              URL không hợp lệ. Hỗ trợ: youtu.be/xxx, youtube.com/watch?v=xxx
            </p>
          )}
        </div>

        {/* Video Preview */}
        {isValidUrl && (
          <div className="space-y-1.5">
            <Label>Xem trước</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Mở trên YouTube <ExternalLink className="size-3" />
            </a>
          </div>
        )}

        {/* Title Input */}
        <div className="space-y-1.5">
          <Label htmlFor="video-title">Tiêu đề (tùy chọn)</Label>
          <Input
            id="video-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề hiển thị"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Để trống sẽ dùng video ID làm tiêu đề mặc định
          </p>
        </div>

        {/* Description Input */}
        <div className="space-y-1.5">
          <Label htmlFor="video-desc">Mô tả (tùy chọn)</Label>
          <Textarea
            id="video-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về video"
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Info Box */}
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Video sẽ được thêm ngay lập tức</li>
            <li>Phụ đề và embedding AI sẽ được xử lý trong nền (30-60 giây)</li>
            <li>Sinh viên có thể xem video ngay sau khi thêm</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidUrl || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Thêm video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
