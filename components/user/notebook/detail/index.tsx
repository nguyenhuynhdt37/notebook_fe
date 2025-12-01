"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  FileText,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { CommunityPreviewResponse } from "@/types/user/community";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import MembershipCheck from "./membership-check";
import Chat from "@/components/chat/chat";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NotebookDetailProps {
  notebookId: string;
}

export default function NotebookDetail({ notebookId }: NotebookDetailProps) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<CommunityPreviewResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotebook();
  }, [notebookId]);

  const loadNotebook = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<CommunityPreviewResponse>(
        `/user/community/${notebookId}/preview`
      );
      setNotebook(response.data);
    } catch (error: any) {
      console.error("Error fetching notebook:", error);
      const message =
        error.response?.data?.message ||
        "Không thể tải thông tin nhóm cộng đồng";
      toast.error(message);
      router.push("/notebook");
    } finally {
      setIsLoading(false);
    }
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "ai":
        return <HelpCircle className="size-4" />;
      case "system":
        return <FileText className="size-4" />;
      default:
        return <User className="size-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center py-12 text-muted-foreground">
          Đang tải...
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center py-12 text-muted-foreground">
          Không tìm thấy nhóm cộng đồng
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chi tiết nhóm cộng đồng
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Xem thông tin và thống kê của nhóm
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin nhóm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notebook.thumbnailUrl && (
                <div className="w-full h-64 rounded-lg border overflow-hidden bg-muted">
                  <img
                    src={notebook.thumbnailUrl}
                    alt={notebook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  {notebook.title}
                </h2>
                {notebook.description && (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={notebook.description} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Người tạo
                  </div>
                  <p className="text-foreground text-sm">
                    {notebook.createdByFullName || "Không xác định"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </div>
                  <p className="text-foreground text-sm">
                    {formatDate(notebook.createdAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Cập nhật lần cuối
                  </div>
                  <p className="text-foreground text-sm">
                    {formatDate(notebook.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                <CardTitle className="text-xl">Tin nhắn gần đây</CardTitle>
              </div>
              <CardDescription className="mt-1">
                {notebook.statistics.messageCount} tin nhắn trong nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notebook.recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {notebook.recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getMessageTypeIcon(message.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {message.authorName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          {message.contentPreview && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {message.contentPreview}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có tin nhắn nào
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="size-5" />
                <CardTitle className="text-xl">Tệp tin gần đây</CardTitle>
              </div>
              <CardDescription className="mt-1">
                {notebook.statistics.fileCount} tệp tin trong nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notebook.recentFiles.length > 0 ? (
                <div className="space-y-3">
                  {notebook.recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="size-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.originalFilename}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {file.mimeType && (
                              <span className="text-xs text-muted-foreground">
                                {file.mimeType}
                              </span>
                            )}
                            {file.fileSize && (
                              <span className="text-xs text-muted-foreground">
                                • {formatFileSize(file.fileSize)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              • {formatDate(file.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có tệp tin nào
                </div>
              )}
            </CardContent>
          </Card>

          <Chat notebookId={notebookId} />
        </div>

        <div className="space-y-6">
          <MembershipCheck
            notebookId={notebookId}
            onJoinSuccess={() => {
              // Refresh page or update UI if needed
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Thành viên</span>
                </div>
                <span className="text-lg font-bold">
                  {notebook.statistics.memberCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Tệp tin</span>
                </div>
                <span className="text-lg font-bold">
                  {notebook.statistics.fileCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Tin nhắn</span>
                </div>
                <span className="text-lg font-bold">
                  {notebook.statistics.messageCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Flashcard</span>
                </div>
                <span className="text-lg font-bold">
                  {notebook.statistics.flashcardCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Quiz</span>
                </div>
                <span className="text-lg font-bold">
                  {notebook.statistics.quizCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
