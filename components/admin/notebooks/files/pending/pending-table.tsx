"use client";

import { useState } from "react";
import { FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { approveFile, rejectFile } from "./file-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FilePreviewDialog from "../file-preview-dialog";

interface PendingTableProps {
  files: NotebookFileResponse[];
  onApproveSuccess?: () => void;
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
    return {
      label: "PDF",
      icon: <FileText className="size-4" />,
    };
  }
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return {
      label: "Word",
      icon: <FileText className="size-4" />,
    };
  }
  if (mimeType === "application/msword") {
    return {
      label: "Word",
      icon: <FileText className="size-4" />,
    };
  }
  return {
    label: mimeType.split("/")[1]?.toUpperCase() || "N/A",
    icon: <FileText className="size-4" />,
  };
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getNotebookTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    community: "Cộng đồng",
    private_group: "Nhóm riêng",
    personal: "Cá nhân",
  };
  return labels[type] || type;
};

export default function PendingTable({
  files,
  onApproveSuccess,
}: PendingTableProps) {
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [fileToReject, setFileToReject] = useState<NotebookFileResponse | null>(
    null
  );
  const [previewFile, setPreviewFile] = useState<NotebookFileResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleApproveFile = async (file: NotebookFileResponse) => {
    setProcessingFileId(file.id);
    try {
      await approveFile(file);
      if (onApproveSuccess) {
        onApproveSuccess();
      }
    } catch (error) {
      // Error đã được xử lý trong approveFile
    } finally {
      setProcessingFileId(null);
    }
  };

  const handleRejectFile = async (file: NotebookFileResponse) => {
    setProcessingFileId(file.id);
    try {
      await rejectFile(file);
      setRejectDialogOpen(false);
      setFileToReject(null);
      if (onApproveSuccess) {
        onApproveSuccess();
      }
    } catch (error) {
      // Error đã được xử lý trong rejectFile
    } finally {
      setProcessingFileId(null);
    }
  };

  const openRejectDialog = (file: NotebookFileResponse) => {
    setFileToReject(file);
    setRejectDialogOpen(true);
  };

  const handleFileClick = (file: NotebookFileResponse) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tên file</TableHead>
            <TableHead>Notebook</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Kích thước</TableHead>
            <TableHead>Số trang</TableHead>
            <TableHead>OCR</TableHead>
            <TableHead>Embedding</TableHead>
            <TableHead>Chunks</TableHead>
            <TableHead>Người đóng góp</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const fileTypeInfo = getFileTypeInfo(file.mimeType);
            const isProcessing = processingFileId === file.id;

            return (
              <TableRow key={file.id} className="hover:bg-accent/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <button
                      onClick={() => handleFileClick(file)}
                      className="font-medium hover:underline text-left cursor-pointer"
                    >
                      {file.originalFilename}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[200px]">
                    {file.notebook.thumbnailUrl && (
                      <img
                        src={file.notebook.thumbnailUrl}
                        alt={file.notebook.title}
                        className="h-6 w-6 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">
                        {file.notebook.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getNotebookTypeLabel(file.notebook.type)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {fileTypeInfo.icon}
                    <span className="text-muted-foreground text-sm">
                      {fileTypeInfo.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatFileSize(file.fileSize)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {file.pagesCount || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  {file.ocrDone ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  {file.embeddingDone ? (
                    <CheckCircle2 className="size-4 text-green-600" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {file.chunksCount || 0}
                  </span>
                </TableCell>
                <TableCell>
                  {file.uploadedBy ? (
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
                      <span className="text-muted-foreground text-sm">
                        {file.uploadedBy.fullName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(file.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveFile(file)}
                      disabled={isProcessing}
                      className="h-8"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                          Đang duyệt
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5 mr-1.5" />
                          Duyệt
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectDialog(file)}
                      disabled={isProcessing}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                          Đang xử lý
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5 mr-1.5" />
                          Từ chối
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="size-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <AlertDialogHeader className="text-left">
                <AlertDialogTitle className="text-xl font-semibold">
                  Từ chối file
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Bạn có chắc chắn muốn từ chối file này? File sẽ không được xử
                  lý AI và sẽ chuyển sang trạng thái "rejected".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row justify-end gap-2 sm:gap-2 pt-2">
                <AlertDialogCancel
                  disabled={processingFileId !== null}
                  className="mt-0"
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => fileToReject && handleRejectFile(fileToReject)}
                  disabled={processingFileId !== null}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {processingFileId === fileToReject?.id ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 size-4" />
                      Từ chối
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreviewDialog
        file={previewFile}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
}
