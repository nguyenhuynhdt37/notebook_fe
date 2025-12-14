"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ListChecks,
  Lightbulb,
  Mic,
  Video,
  Network,
  FileText,
  MessageSquare,
  BookOpen,
  FileQuestion,
  Target,
  Clock as ClockIcon,
  Languages,
  Baby,
  BrainCircuit,
  ShieldAlert,
  Microscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AiSetResponse, AiSetType, AiSetStatus } from "@/types/user/ai-task";

interface SetItemProps {
  set: AiSetResponse;
  onView?: (setId: string) => void;
  onDelete?: (setId: string) => void;
  isPlaying?: boolean;
}

const SET_TYPE_CONFIG: Record<
  AiSetType,
  { icon: React.ElementType; label: string }
> = {
  quiz: { icon: ListChecks, label: "Quiz" },
  flashcard: { icon: Lightbulb, label: "Flashcards" },
  tts: { icon: Mic, label: "Audio Overview" },
  video: { icon: Video, label: "Video" },
  mindmap: { icon: Network, label: "Sơ đồ tư duy" },
  summary: { icon: FileText, label: "Tóm tắt" },
  discuss: { icon: MessageSquare, label: "Câu hỏi gợi mở" },
  "study-guide": { icon: BookOpen, label: "Study Guide" },
  faq: { icon: FileQuestion, label: "FAQ" },
  "key-concepts": { icon: Target, label: "Key Concepts" },
  timeline: { icon: ClockIcon, label: "Timeline" },
  translate: { icon: Languages, label: "Dịch thuật" },
  eli5: { icon: Baby, label: "ELI5" },
  socratic: { icon: BrainCircuit, label: "Gợi mở (Socratic)" },
  critic: { icon: ShieldAlert, label: "Phản biện" },
  "deep-dive": { icon: Microscope, label: "Phân tích sâu" },
};

const STATUS_CONFIG: Record<
  AiSetStatus,
  {
    icon: React.ElementType;
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  queued: { icon: Clock, label: "Đang chờ", variant: "outline" },
  processing: { icon: Loader2, label: "Đang xử lý", variant: "secondary" },
  done: { icon: CheckCircle2, label: "Hoàn thành", variant: "default" },
  failed: { icon: XCircle, label: "Thất bại", variant: "destructive" },
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function SetItem({
  set,
  onView,
  onDelete,
  isPlaying = false,
}: SetItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const typeConfig = SET_TYPE_CONFIG[set.setType] || SET_TYPE_CONFIG.quiz;
  const statusConfig = STATUS_CONFIG[set.status] || STATUS_CONFIG.queued;
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isProcessing = set.status === "queued" || set.status === "processing";
  const canView = set.status === "done";

  const handleClick = () => {
    if (canView) {
      onView?.(set.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(set.id);
  };

  return (
    <>
      <div
        className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isPlaying
            ? "bg-muted/60 border border-primary/30"
            : canView
            ? "cursor-pointer hover:bg-muted/50 border border-transparent"
            : "hover:bg-muted/40 border border-transparent"
        }`}
        onClick={handleClick}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`shrink-0 p-1.5 rounded-md bg-muted/50 mt-0.5 ${
                  isPlaying ? "animate-pulse" : ""
                }`}
              >
                <TypeIcon
                  className={`size-4 ${isPlaying ? "text-primary" : ""}`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-[100]">
              <p>{typeConfig.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {set.title || typeConfig.label}
            </p>
            {set.status !== "done" && (
              <Badge
                variant={statusConfig.variant}
                className="text-xs px-2 py-0.5 h-5 font-medium gap-1 shrink-0"
              >
                <StatusIcon
                  className={`size-3 ${isProcessing ? "animate-spin" : ""}`}
                />
                {statusConfig.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Avatar className="size-4">
              <AvatarImage src={set.userAvatar} alt={set.userFullName} />
              <AvatarFallback className="text-[8px]">
                {getInitials(set.userFullName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {set.userFullName}
              {set.owner && (
                <span className="text-foreground/70 font-medium"> (bạn)</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {set.fileCount} files
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(set.createdAt)}
            </span>
          </div>

          {set.status === "failed" && set.errorMessage && (
            <p className="text-xs text-destructive mt-1 truncate">
              {set.errorMessage}
            </p>
          )}
        </div>

        {set.owner && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 size-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-semibold text-foreground">
                {set.title || typeConfig.label}
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
    </>
  );
}
