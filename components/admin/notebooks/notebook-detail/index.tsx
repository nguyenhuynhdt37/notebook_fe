"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookDetailResponse } from "@/types/admin/notebook";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

interface NotebookDetailProps {
  notebookId: string;
}

export default function NotebookDetail({ notebookId }: NotebookDetailProps) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<NotebookDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotebook();
  }, [notebookId]);

  const loadNotebook = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<NotebookDetailResponse>(
        `/admin/community/${notebookId}/detail`
      );
      setNotebook(response.data);
    } catch (error) {
      console.error("Error fetching notebook:", error);
      toast.error("Không thể tải thông tin notebook");
      router.push("/admin/notebooks");
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "community":
        return "Cộng đồng";
      case "private_group":
        return "Nhóm riêng";
      case "personal":
        return "Cá nhân";
      default:
        return type;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Chủ sở hữu";
      case "admin":
        return "Quản trị viên";
      case "member":
        return "Thành viên";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
    );
  }

  if (!notebook) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không tìm thấy notebook
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chi tiết notebook
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Thông tin chi tiết của notebook
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin notebook</CardTitle>
          <CardDescription className="mt-1">
            Chi tiết thông tin notebook trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notebook.thumbnailUrl && (
              <div className="w-full aspect-video rounded-lg border overflow-hidden bg-muted">
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
                  Loại
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {getTypeLabel(notebook.type)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Hiển thị
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  {notebook.visibility === "public" ? "Công khai" : "Riêng tư"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Người tạo
                </div>
                <p className="text-foreground text-sm">
                  {notebook.createdByFullName}
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
                  Ngày cập nhật
                </div>
                <p className="text-foreground text-sm">
                  {formatDate(notebook.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="size-5" />
                <CardTitle className="text-xl">Thành viên</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Danh sách thành viên ({notebook.members.totalCount})
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/notebooks/${notebookId}/members`)
              }
            >
              <Users className="size-4 mr-2" />
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notebook.members.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có thành viên
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notebook.members.items.map((member) => (
                    <TableRow key={member.userId}>
                      <TableCell className="font-medium">
                        {member.userFullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.userEmail}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {getRoleLabel(member.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {member.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-5" />
            <CardTitle className="text-xl">Tệp tin</CardTitle>
          </div>
          <CardDescription className="mt-1">
            Danh sách tệp tin ({notebook.files.totalCount})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notebook.files.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có tệp tin
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Tên tệp</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notebook.files.items.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        {file.originalFilename}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {file.mimeType}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                          {file.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(file.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(file.storageUrl, "_blank")}
                        >
                          <Download className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
