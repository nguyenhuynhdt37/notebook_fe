"use client";

import { useEffect, useState } from "react";
import { FileText, User as UserIcon, HardDrive } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { RegulationFile } from "@/types/user/regulation-chat";

interface RegulationFileDetailProps {
  fileId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function RegulationFileDetail({
  fileId,
  open,
  onClose,
}: RegulationFileDetailProps) {
  const [file, setFile] = useState<RegulationFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && fileId) {
      loadFileDetail();
    }
  }, [open, fileId]);

  const loadFileDetail = async () => {
    if (!fileId) return;

    setIsLoading(true);
    try {
      const response = await api.get<{ data: RegulationFile }>(
        `/user/regulation/files/${fileId}`
      );
      setFile(response.data.data);
    } catch (error) {
      console.error("Error loading file detail:", error);
      toast.error("Không thể tải thông tin tài liệu");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-muted-foreground" />
            Chi tiết tài liệu
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-6 pr-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ) : file ? (
            <div className="space-y-6 pr-4">
              {/* Filename */}
              <div className="space-y-1.5">
                <h3 className="text-base font-medium break-words">
                  {file.originalFilename}
                </h3>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Thông tin cơ bản
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <HardDrive className="size-3.5" />
                      Kích thước
                    </div>
                    <p className="text-sm">{formatFileSize(file.fileSize)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="size-3.5" />
                      Định dạng
                    </div>
                    <p className="text-sm">{file.mimeType}</p>
                  </div>
                  {file.pagesCount && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="size-3.5" />
                        Số trang
                      </div>
                      <p className="text-sm">{file.pagesCount} trang</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserIcon className="size-3.5" />
                      Người tải lên
                    </div>
                    <p className="text-sm">{file.uploadedByName}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Thời gian
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Tải lên
                    </span>
                    <span className="text-sm text-right">
                      {formatDate(file.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Cập nhật
                    </span>
                    <span className="text-sm text-right">
                      {formatDate(file.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Download Link */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Tải xuống
                </h4>
                <a
                  href={file.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all transition-colors"
                >
                  Xem tài liệu gốc
                </a>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
