"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  User,
  Database,
  Video,
  Headphones,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookFileDetailResponse } from "@/types/admin/notebook-file";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FileDetailProps {
  notebookId: string;
  fileId: string;
}

export default function FileDetail({ notebookId, fileId }: FileDetailProps) {
  const router = useRouter();
  const [data, setData] = useState<NotebookFileDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFileDetail();
  }, [notebookId, fileId]);

  const loadFileDetail = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NotebookFileDetailResponse>(
        `/admin/notebooks/${notebookId}/files/${fileId}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching file detail:", error);
      toast.error("Không thể tải thông tin file");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      completed: { label: "Hoàn thành", variant: "default" },
      processing: { label: "Đang xử lý", variant: "secondary" },
      pending: { label: "Chờ xử lý", variant: "secondary" },
      failed: { label: "Thất bại", variant: "destructive" },
    };
    const config = statusMap[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không tìm thấy file
      </div>
    );
  }

  const { fileInfo, totalTextChunks, generatedContentCounts } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết file</h1>
          <p className="text-muted-foreground mt-1.5">
            Thông tin chi tiết của file
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-3">
                <FileText className="size-5" />
                {fileInfo.originalFilename}
              </CardTitle>
              <CardDescription className="mt-1">
                {fileInfo.mimeType}
              </CardDescription>
            </div>
            {getStatusBadge(fileInfo.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Kích thước
              </div>
              <p className="text-foreground">
                {formatFileSize(fileInfo.fileSize)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Số trang
              </div>
              <p className="text-foreground">
                {fileInfo.pagesCount ?? "Không xác định"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                OCR
              </div>
              <div className="flex items-center gap-2">
                {fileInfo.ocrDone ? (
                  <>
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-foreground">Đã hoàn thành</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Chưa hoàn thành
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Embedding
              </div>
              <div className="flex items-center gap-2">
                {fileInfo.embeddingDone ? (
                  <>
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-foreground">Đã hoàn thành</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Chưa hoàn thành
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Ngày tạo
              </div>
              <p className="text-foreground text-sm">
                {formatDate(fileInfo.createdAt)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Ngày cập nhật
              </div>
              <p className="text-foreground text-sm">
                {formatDate(fileInfo.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(fileInfo.storageUrl, "_blank")}
            >
              <Download className="size-4 mr-2" />
              Tải xuống file
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Cấu hình Chunk</CardTitle>
          <CardDescription>
            Thông tin về cách file được chia nhỏ để xử lý
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Chunk Size
              </div>
              <p className="text-foreground text-2xl font-bold">
                {fileInfo.chunkSize}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Chunk Overlap
              </div>
              <p className="text-foreground text-2xl font-bold">
                {fileInfo.chunkOverlap}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Tổng Chunks
              </div>
              <p className="text-foreground text-2xl font-bold">
                {fileInfo.chunksCount}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Text Chunks
              </div>
              <p className="text-foreground text-2xl font-bold">
                {totalTextChunks}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nội dung đã tạo</CardTitle>
          <CardDescription>
            Số lượng nội dung AI đã tạo từ file này
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Video className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">
                  Video
                </span>
              </div>
              <p className="text-3xl font-bold">
                {generatedContentCounts.video}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Headphones className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">
                  Podcast
                </span>
              </div>
              <p className="text-3xl font-bold">
                {generatedContentCounts.podcast}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">
                  Flashcard
                </span>
              </div>
              <p className="text-3xl font-bold">
                {generatedContentCounts.flashcard}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">
                  Quiz
                </span>
              </div>
              <p className="text-3xl font-bold">
                {generatedContentCounts.quiz}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {fileInfo.uploadedBy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="size-5" />
              Người upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Tên
                </div>
                <p className="text-foreground">
                  {fileInfo.uploadedBy.fullName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Email
                </div>
                <p className="text-foreground">{fileInfo.uploadedBy.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {fileInfo.notebook && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="size-5" />
              Notebook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Tiêu đề
                </div>
                <p className="text-foreground font-medium">
                  {fileInfo.notebook.title}
                </p>
              </div>

              {fileInfo.notebook.description && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Mô tả
                  </div>
                  <p className="text-foreground">
                    {fileInfo.notebook.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Loại
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                    {fileInfo.notebook.type}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Hiển thị
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                    {fileInfo.notebook.visibility === "public"
                      ? "Công khai"
                      : "Riêng tư"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
