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
  FileText,
  Lightbulb,
  Mic,
  Video,
  Sparkles,
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
import { AiTaskResponse, AiTaskType, AiTaskStatus } from "@/types/user/ai-task";

interface TaskItemProps {
  task: AiTaskResponse;
  onView?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const TASK_TYPE_CONFIG: Record<
  AiTaskType,
  { icon: React.ElementType; label: string }
> = {
  quiz: { icon: ListChecks, label: "Quiz" },
  summary: { icon: FileText, label: "Summary" },
  flashcards: { icon: Lightbulb, label: "Flashcards" },
  tts: { icon: Mic, label: "Audio" },
  video: { icon: Video, label: "Video" },
  other: { icon: Sparkles, label: "Khác" },
};

const STATUS_CONFIG: Record<
  AiTaskStatus,
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

export default function TaskItem({ task, onView, onDelete }: TaskItemProps) {
  const typeConfig = TASK_TYPE_CONFIG[task.taskType];
  const statusConfig = STATUS_CONFIG[task.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isProcessing = task.status === "queued" || task.status === "processing";

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="shrink-0 p-1.5 rounded-md bg-muted/50">
        <TypeIcon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{typeConfig.label}</p>
          <Badge
            variant={statusConfig.variant}
            className="text-xs px-2 py-0.5 h-5 font-medium gap-1"
          >
            <StatusIcon
              className={`size-3 ${isProcessing ? "animate-spin" : ""}`}
            />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Avatar className="size-4">
            <AvatarImage src={task.userAvatar} alt={task.userFullName} />
            <AvatarFallback className="text-[8px]">
              {getInitials(task.userFullName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {task.userFullName}
            {task.isOwner && (
              <span className="text-foreground/70 font-medium"> (bạn)</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {task.fileCount} files
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(task.createdAt)}
          </span>
        </div>

        {task.status === "failed" && task.errorMessage && (
          <p className="text-xs text-destructive mt-1 truncate">
            {task.errorMessage}
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
          {task.status === "done" && (
            <DropdownMenuItem
              onClick={() => onView?.(task.id)}
              className="gap-2"
            >
              <Eye className="size-4" />
              <span className="text-sm">Xem kết quả</span>
            </DropdownMenuItem>
          )}
          {task.isOwner && (
            <DropdownMenuItem
              onClick={() => onDelete?.(task.id)}
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
