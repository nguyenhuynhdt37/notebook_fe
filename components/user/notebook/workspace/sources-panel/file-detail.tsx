"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/api/client/axios";
import {
  UserNotebookFileDetailResponse,
  FileChunkResponse,
} from "@/types/admin/notebook-file";

interface FileDetailProps {
  notebookId: string;
  fileId: string;
  onBack?: () => void;
}

export default function FileDetail({
  notebookId,
  fileId,
  onBack,
}: FileDetailProps) {
  const [fileDetail, setFileDetail] =
    useState<UserNotebookFileDetailResponse | null>(null);
  const [chunks, setChunks] = useState<FileChunkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<UserNotebookFileDetailResponse>(
          `/user/notebooks/${notebookId}/files/${fileId}`
        );
        setFileDetail(response.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Vui lòng đăng nhập");
        } else if (err.response?.status === 404) {
          setError("File không tồn tại");
        } else {
          setError("Không thể tải thông tin file");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFileDetail();
  }, [notebookId, fileId]);

  const fetchChunks = async () => {
    try {
      setChunksLoading(true);
      const response = await api.get<FileChunkResponse[]>(
        `/user/notebooks/${notebookId}/files/${fileId}/chunks`
      );
      const sortedChunks = response.data.sort(
        (a, b) => a.chunkIndex - b.chunkIndex
      );
      setChunks(sortedChunks);
    } catch (err: any) {
      console.error("Error fetching chunks:", err);
    } finally {
      setChunksLoading(false);
    }
  };

  useEffect(() => {
    if (fileDetail?.fileInfo.status === "done") {
      fetchChunks();
    }
  }, [fileDetail]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      processing: "Đang xử lý",
      done: "Hoàn thành",
      failed: "Thất bại",
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "done") return "default";
    if (status === "processing" || status === "approved") return "secondary";
    if (status === "failed" || status === "rejected") return "destructive";
    return "outline";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !fileDetail) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="size-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">Có lỗi xảy ra</h3>
          <p className="text-xs text-muted-foreground mb-3">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="size-3 mr-1.5" />
              Quay lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  const fullContent = chunks
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .map((chunk) => chunk.content)
    .join("\n\n---\n\n");

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border/60 bg-background px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon-sm" onClick={onBack}>
              <ArrowLeft className="size-3.5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {fileDetail.fileInfo.originalFilename}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={getStatusVariant(fileDetail.fileInfo.status)}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {getStatusLabel(fileDetail.fileInfo.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(fileDetail.fileInfo.fileSize)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="content" className="h-full flex flex-col">
          <div className="border-b border-border/60 px-3 shrink-0">
            <TabsList className="bg-transparent h-8">
              <TabsTrigger
                value="content"
                className="text-xs"
                disabled={chunks.length === 0}
              >
                Nội dung
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">
                Thông tin
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="content"
            className="flex-1 overflow-y-auto m-0 p-3"
          >
            {chunksLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Đang tải nội dung...
                  </p>
                </div>
              </div>
            ) : chunks.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center">
                  <FileText className="size-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">
                    File chưa có nội dung hoặc chưa được xử lý
                  </p>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs bg-muted/20 p-3 rounded border border-border/40 leading-relaxed font-mono">
                {fullContent}
              </pre>
            )}
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-y-auto m-0 p-3">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Thông tin file</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground mb-0.5">Tên file</p>
                      <p className="font-medium truncate">
                        {fileDetail.fileInfo.originalFilename}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">Kích thước</p>
                      <p className="font-medium">
                        {formatFileSize(fileDetail.fileInfo.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">Loại file</p>
                      <p className="font-medium truncate">
                        {fileDetail.fileInfo.mimeType}
                      </p>
                    </div>
                    {fileDetail.fileInfo.pagesCount && (
                      <div>
                        <p className="text-muted-foreground mb-0.5">Số trang</p>
                        <p className="font-medium">
                          {fileDetail.fileInfo.pagesCount}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Nội dung đã tạo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-muted/30 rounded border border-border/40">
                      <p className="text-lg font-bold">
                        {fileDetail.generatedContentCounts.video}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Video
                      </p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded border border-border/40">
                      <p className="text-lg font-bold">
                        {fileDetail.generatedContentCounts.podcast}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Podcast
                      </p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded border border-border/40">
                      <p className="text-lg font-bold">
                        {fileDetail.generatedContentCounts.flashcard}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Flashcard
                      </p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded border border-border/40">
                      <p className="text-lg font-bold">
                        {fileDetail.generatedContentCounts.quiz}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Quiz
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fileDetail.contributor && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Người đóng góp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        {fileDetail.contributor.avatarUrl ? (
                          <AvatarImage
                            src={fileDetail.contributor.avatarUrl}
                            alt={fileDetail.contributor.fullName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-muted text-xs">
                          {getInitials(fileDetail.contributor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {fileDetail.contributor.fullName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {fileDetail.contributor.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
