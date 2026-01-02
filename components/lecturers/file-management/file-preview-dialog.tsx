"use client";

import { FileText, Download, Calendar, User, Database, CheckCircle2, XCircle } from "lucide-react";
import { NotebookFile } from "@/types/lecturer/exam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FilePreviewDialogProps {
  file: NotebookFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileTypeInfo = (mimeType: string) => {
  if (mimeType === "application/pdf") {
    return { label: "PDF", color: "bg-red-100 text-red-800" };
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return { label: "Word", color: "bg-blue-100 text-blue-800" };
  }
  if (mimeType === "application/msword") {
    return { label: "Word", color: "bg-blue-100 text-blue-800" };
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    return { label: "PowerPoint", color: "bg-orange-100 text-orange-800" };
  }
  if (mimeType === "text/plain") {
    return { label: "Text", color: "bg-gray-100 text-gray-800" };
  }
  return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  if (!file) return null;

  const fileTypeInfo = getFileTypeInfo(file.mimeType);
  const isReady = file.status === "done" && file.ocrDone && file.embeddingDone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="size-5" />
            Chi tiết file
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <FileText className="size-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg break-words">
                  {file.originalFilename}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={fileTypeInfo.color}>
                    {fileTypeInfo.label}
                  </Badge>
                  <Badge variant="outline">
                    {formatFileSize(file.fileSize)}
                  </Badge>
                  {isReady ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="size-3 mr-1" />
                      Sẵn sàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600">
                      <XCircle className="size-3 mr-1" />
                      Đang xử lý
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notebook Info */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Database className="size-4" />
              Notebook
            </h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium">{file.notebookTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Loại: {file.notebookType}
              </p>
            </div>
          </div>

          <Separator />

          {/* Processing Status */}
          <div className="space-y-3">
            <h4 className="font-medium">Trạng thái xử lý</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {file.ocrDone ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <XCircle className="size-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">OCR</p>
                  <p className="text-xs text-muted-foreground">
                    {file.ocrDone ? "Đã hoàn thành" : "Chưa xử lý"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {file.embeddingDone ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <XCircle className="size-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">Embedding</p>
                  <p className="text-xs text-muted-foreground">
                    {file.embeddingDone ? "Đã hoàn thành" : "Chưa xử lý"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Info */}
          {file.chunksCount && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Thông tin nội dung</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Số chunks:</p>
                      <p className="font-medium">{file.chunksCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trạng thái:</p>
                      <p className="font-medium">{file.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Content Preview */}
          {file.contentPreview && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Preview nội dung</h4>
                <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    {file.contentPreview}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Upload Info */}
          <div className="space-y-3">
            <h4 className="font-medium">Thông tin upload</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {file.uploadedBy.avatarUrl && (
                      <AvatarImage
                        src={file.uploadedBy.avatarUrl}
                        alt={file.uploadedBy.fullName}
                      />
                    )}
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(file.uploadedBy.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {file.uploadedBy.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.uploadedBy.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(file.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ngày upload
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {isReady && (
              <Button>
                <Download className="size-4 mr-2" />
                Sử dụng tạo câu hỏi
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}