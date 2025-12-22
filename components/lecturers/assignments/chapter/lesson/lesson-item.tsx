"use client";

import { ChapterItem, ChapterItemType } from "@/types/lecturer/chapter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Play,
  HelpCircle,
  BookOpen,
  StickyNote,
  MoreVertical,
  Trash,
  Eye,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LessonItemProps {
  item: ChapterItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

const ITEM_TYPE_CONFIG: Record<
  ChapterItemType,
  { icon: typeof FileText; color: string; label: string }
> = {
  FILE: {
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
    label: "Tài liệu",
  },
  VIDEO: { icon: Play, color: "bg-purple-100 text-purple-600", label: "Video" },
  QUIZ: {
    icon: HelpCircle,
    color: "bg-orange-100 text-orange-600",
    label: "Trắc nghiệm",
  },
  LECTURE: {
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-600",
    label: "Bài giảng",
  },
  NOTE: {
    icon: StickyNote,
    color: "bg-yellow-100 text-yellow-600",
    label: "Ghi chú",
  },
  FLASHCARD: {
    icon: BookOpen,
    color: "bg-pink-100 text-pink-600",
    label: "Flashcard",
  },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LessonItem({
  item,
  onEdit,
  onDelete,
  onPreview,
}: LessonItemProps) {
  const config = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.FILE;
  const Icon = config.icon;

  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-sm hover:border-primary/30">
      {/* Icon */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          config.color
        )}
      >
        <Icon className="size-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{config.label}</span>
          {item.metadata.fileSize && (
            <>
              <span>•</span>
              <span>{formatFileSize(item.metadata.fileSize)}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onPreview && (
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="mr-2 size-4" />
              Xem trước
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Xóa
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
