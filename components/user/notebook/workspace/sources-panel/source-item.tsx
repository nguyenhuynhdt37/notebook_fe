"use client";

import { useState } from "react";
import {
  MoreVertical,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  File,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import { useUserStore } from "@/stores/user";

interface SourceItemProps {
  source: NotebookFileResponse;
  notebookId: string;
  selected?: boolean;
  onRemove?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  onViewDetail?: (fileId: string) => void;
}

const getFileIcon = (mimeType: string, filename: string) => {
  const lowerType = mimeType.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  // PDF
  if (lowerType.includes("pdf") || ext === "pdf") {
    return FileText;
  }
  // Word/Doc
  if (
    lowerType.includes("word") ||
    lowerType.includes("document") ||
    ["doc", "docx"].includes(ext)
  ) {
    return FileText;
  }
  // Excel/Spreadsheet
  if (
    lowerType.includes("excel") ||
    lowerType.includes("spreadsheet") ||
    ["xls", "xlsx", "csv"].includes(ext)
  ) {
    return FileSpreadsheet;
  }
  // Image
  if (
    lowerType.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
  ) {
    return FileImage;
  }
  // Video
  if (
    lowerType.includes("video") ||
    ["mp4", "avi", "mov", "mkv", "webm"].includes(ext)
  ) {
    return FileVideo;
  }
  // Audio
  if (
    lowerType.includes("audio") ||
    ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)
  ) {
    return FileAudio;
  }
  // Code
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "html",
      "css",
      "json",
    ].includes(ext)
  ) {
    return FileCode;
  }
  return File;
};

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
    failed: "Thất bại",
  };
  return statusMap[status] || status;
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "processing" || status === "approved") return "secondary";
  if (status === "failed" || status === "rejected") return "destructive";
  return "outline";
};

export default function SourceItem({
  source,
  notebookId,
  selected = false,
  onRemove,
  onToggleSelect,
  onViewDetail,
}: SourceItemProps) {
  const user = useUserStore((state) => state.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const IconComponent = getFileIcon(source.mimeType, source.originalFilename);

  const isMyFile =
    user &&
    source.uploadedBy &&
    String(user.id) === String(source.uploadedBy.id);
  const canRemove = isMyFile && onRemove;
  const canSelect = source.status === "done" && onToggleSelect;
  const isDone = source.status === "done";

  // Click vào item = xem chi tiết
  const handleItemClick = () => {
    if (isDone) {
      onViewDetail?.(source.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onRemove?.(source.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(source.id);
  };

  return (
    <>
      <div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          selected
            ? "bg-muted/60 border border-border/60"
            : "hover:bg-muted/40 border border-transparent"
        } ${isDone ? "cursor-pointer" : ""}`}
        onClick={handleItemClick}
      >
        {/* Icon */}
        <div className="shrink-0 p-1.5 rounded-md bg-muted/50">
          <IconComponent className="size-4 text-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground leading-tight">
            {source.originalFilename}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              {formatFileSize(source.fileSize)}
            </span>
            {/* Chỉ hiển thị badge khi không phải done */}
            {source.status !== "done" && (
              <Badge
                variant={getStatusVariant(source.status)}
                className="text-xs px-2 py-0.5 h-5 font-medium"
              >
                {getStatusLabel(source.status)}
              </Badge>
            )}
            {source.uploadedBy && (
              <span className="text-xs text-muted-foreground truncate">
                {source.uploadedBy.fullName}
                {isMyFile && (
                  <span className="text-foreground/70 font-medium"> (bạn)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Checkbox ở bên phải */}
        {canSelect && (
          <div
            className="shrink-0"
            onClick={handleCheckboxClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Checkbox checked={selected} className="size-4.5" />
          </div>
        )}

        {/* Menu - chỉ hiện khi có quyền xóa */}
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 size-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <MoreVertical className="size-4 group-hover:hidden" />
            <Trash2 className="size-4 hidden group-hover:block" />
          </Button>
        )}
      </div>

      {canRemove && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa file</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa file{" "}
                <span className="font-semibold text-foreground">
                  {source.originalFilename}
                </span>
                ? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
