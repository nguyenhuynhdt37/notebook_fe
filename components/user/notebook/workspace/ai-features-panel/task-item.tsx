"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  ListChecks,
  Lightbulb,
  Mic,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiSetResponse, AiSetType, AiSetStatus } from "@/types/user/ai-task";

interface SetItemProps {
  set: AiSetResponse;
  onView?: (setId: string) => void;
  onDelete?: (setId: string) => void;
}

const SET_TYPE_CONFIG: Record<
  AiSetType,
  { icon: React.ElementType; label: string }
> = {
  quiz: { icon: ListChecks, label: "Quiz" },
  flashcard: { icon: Lightbulb, label: "Flashcards" },
  tts: { icon: Mic, label: "Audio" },
  video: { icon: Video, label: "Video" },
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

export default function SetItem({ set, onView, onDelete }: SetItemProps) {
  const typeConfig = SET_TYPE_CONFIG[set.setType] || SET_TYPE_CONFIG.quiz;
  const statusConfig = STATUS_CONFIG[set.status] || STATUS_CONFIG.queued;
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isProcessing = set.status === "queued" || set.status === "processing";

  return (
    <div className="group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="shrink-0 p-1.5 rounded-md bg-muted/50 mt-0.5">
        <TypeIcon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {set.title || typeConfig.label}
          </p>
          <Badge
            variant={statusConfig.variant}
            className="text-xs px-2 py-0.5 h-5 font-medium gap-1 shrink-0"
          >
            <StatusIcon
              className={`size-3 ${isProcessing ? "animate-spin" : ""}`}
            />
            {statusConfig.label}
          </Badge>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 opacity-0 group-hover:opacity-100 size-8"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {set.status === "done" && (
            <DropdownMenuItem
              onClick={() => onView?.(set.id)}
              className="gap-2"
            >
              <Eye className="size-4" />
              <span className="text-sm">Xem kết quả</span>
            </DropdownMenuItem>
          )}
          {set.owner && (
            <DropdownMenuItem
              onClick={() => onDelete?.(set.id)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="size-4" />
              <span className="text-sm">Xóa</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
