"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
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
import FileActions from "./file-actions";
import FilePreviewDialog from "./file-preview-dialog";

interface FileTableProps {
  files: NotebookFileResponse[];
  onRetrySuccess?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Chờ duyệt",
    icon: <Clock className="size-3.5" />,
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  approved: {
    label: "Đã duyệt",
    icon: <CheckCircle2 className="size-3.5" />,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
  rejected: {
    label: "Đã từ chối",
    icon: <XCircle className="size-3.5" />,
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
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
  onRetrySuccess,
}: FileTableProps) {
  const [previewFile, setPreviewFile] = useState<NotebookFileResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileClick = (file: NotebookFileResponse) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Tên file</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Số trang</TableHead>
              <TableHead>OCR</TableHead>
              <TableHead>Embedding</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>Người đóng góp</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const statusInfo =
                statusConfig[file.status] || statusConfig.pending;
              const fileTypeInfo = getFileTypeInfo(file.mimeType);
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
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
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
                  <TableCell className="text-right">
                    <FileActions file={file} onRetrySuccess={onRetrySuccess} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <FilePreviewDialog
        file={previewFile}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
}
