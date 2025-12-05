"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, File, Video, Music, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const getFileIcon = (mimeType: string) => {
  const lowerType = mimeType.toLowerCase();
  if (
    lowerType.includes("pdf") ||
    lowerType.includes("word") ||
    lowerType.includes("document")
  ) {
    return File;
  }
  if (lowerType.includes("video") || lowerType.includes("mp4")) {
    return Video;
  }
  if (
    lowerType.includes("audio") ||
    lowerType.includes("mp3") ||
    lowerType.includes("podcast")
  ) {
    return Music;
  }
  return FileQuestion;
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
  const IconComponent = getFileIcon(source.mimeType);

  const isMyFile =
    user &&
    source.uploadedBy &&
    String(user.id) === String(source.uploadedBy.id);
  const canRemove = isMyFile && onRemove;
  const canSelect = source.status === "done" && onToggleSelect;

  const handleFileClick = () => {
    onViewDetail?.(source.id);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div
        className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all cursor-pointer ${
          selected
            ? "bg-muted/50 border border-border/60"
            : "hover:bg-muted/30 border border-transparent"
        }`}
        onClick={handleFileClick}
      >
        {canSelect && (
          <div
            className="shrink-0"
            onClick={handleCheckboxClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Checkbox checked={selected} className="size-4" />
          </div>
        )}
        <div className="shrink-0">
          <IconComponent className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground leading-snug">
            {source.originalFilename}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(source.fileSize)}
            </span>
            <Badge
              variant={getStatusVariant(source.status)}
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {getStatusLabel(source.status)}
            </Badge>
            {source.uploadedBy && (
              <span className="text-xs text-muted-foreground truncate">
                • {source.uploadedBy.fullName}
                {isMyFile && <span className="text-foreground/60"> (bạn)</span>}
              </span>
            )}
          </div>
        </div>
        {canRemove && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 h-7 w-7"
                  onClick={handleDeleteClick}
                >
                  <X className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Xóa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
