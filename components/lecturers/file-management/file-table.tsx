"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { NotebookFile } from "@/types/lecturer/exam";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import FilePreviewDialog from "@/components/lecturers/file-management/file-preview-dialog";

interface FileTableProps {
  files: NotebookFile[];
  onFileDeleted?: () => void;
  showNotebook?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Chờ xử lý",
    icon: <Clock className="size-3.5" />,
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  processing: {
    label: "Đang xử lý",
    icon: <Clock className="size-3.5" />,
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  },
  failed: {
    label: "Lỗi",
    icon: <AlertCircle className="size-3.5" />,
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  },
  done: {
    label: "Hoàn thành",
    icon: <CheckCircle2 className="size-3.5" />,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
};

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
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return {
      label: "PowerPoint",
      icon: <FileText className="size-4" />,
    };
  }
  if (mimeType === "text/plain") {
    return {
      label: "Text",
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

export default function FileTable({
  files,
  onFileDeleted,
  showNotebook = false,
}: FileTableProps) {
  const [previewFile, setPreviewFile] = useState<NotebookFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteFile, setDeleteFile] = useState<NotebookFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileClick = (file: NotebookFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!deleteFile) return;

    setIsDeleting(true);
    try {
      await examApi.deleteFile(deleteFile.notebookId, deleteFile.id);
      toast.success("Đã xóa file thành công");
      onFileDeleted?.();
      setDeleteFile(null);
    } catch (error: any) {
      console.error("Error deleting file:", error);
      const errorMessage = error.response?.data?.message || "Không thể xóa file";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFileReady = (file: NotebookFile) => {
    return file.status === "done" && file.ocrDone && file.embeddingDone;
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Tên file</TableHead>
              {showNotebook && <TableHead>Notebook</TableHead>}
              <TableHead>Loại</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>OCR</TableHead>
              <TableHead>Embedding</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>Người upload</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const statusInfo =
                statusConfig[file.status] || statusConfig.pending;
              const fileTypeInfo = getFileTypeInfo(file.mimeType);
              const ready = isFileReady(file);
              
              return (
                <TableRow key={file.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <button
                        onClick={() => handleFileClick(file)}
                        className="font-medium hover:underline text-left cursor-pointer max-w-xs truncate"
                      >
                        {file.originalFilename}
                      </button>
                    </div>
                  </TableCell>
                  {showNotebook && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {file.notebookTitle}
                      </Badge>
                    </TableCell>
                  )}
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                      {ready && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Sẵn sàng
                        </Badge>
                      )}
                    </div>
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
                        <span className="text-muted-foreground text-sm max-w-24 truncate">
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileClick(file)}>
                          <Eye className="mr-2 size-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteFile(file)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Xóa file
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* File Preview Dialog */}
      <FilePreviewDialog
        file={previewFile}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa file</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file "{deleteFile?.originalFilename}"?
              <br />
              <br />
              <span className="font-medium text-foreground">
                Lưu ý: Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến file này.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}