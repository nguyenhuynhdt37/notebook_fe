"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChapterItem, ChapterItemType } from "@/types/lecturer/chapter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Play,
  HelpCircle,
  BookOpen,
  StickyNote,
  GripVertical,
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
import React from "react";

interface SortableItemProps {
  item: ChapterItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

interface SortableItemContentProps extends SortableItemProps {
  isDragging?: boolean;
  isOverlay?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  attributes?: React.HTMLAttributes<HTMLElement>;
  listeners?: React.HTMLAttributes<HTMLElement>;
  style?: React.CSSProperties;
}

const ITEM_TYPE_CONFIG: Record<
  ChapterItemType,
  { icon: typeof FileText; color: string; label: string }
> = {
  FILE: {
    icon: FileText,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Tài liệu",
  },
  VIDEO: {
    icon: Play,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    label: "Video",
  },
  QUIZ: {
    icon: HelpCircle,
    color:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    label: "Trắc nghiệm",
  },
  LECTURE: {
    icon: BookOpen,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "Bài giảng",
  },
  NOTE: {
    icon: StickyNote,
    color:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Ghi chú",
  },
  FLASHCARD: {
    icon: BookOpen,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    label: "Flashcard",
  },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Component nội dung có thể tái sử dụng cho cả sortable và overlay
export const SortableItemContent = React.memo(function SortableItemContent({
  item,
  onEdit,
  onDelete,
  onPreview,
  isDragging,
  isOverlay,
  setNodeRef,
  attributes,
  listeners,
  style,
}: SortableItemContentProps) {
  const config = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.FILE;
  const Icon = config.icon;

  // Placeholder khi đang kéo
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 min-h-[72px]"
      >
        <span className="text-sm font-medium text-primary/60">Thả vào đây</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-3",
        !isOverlay && "hover:shadow-sm hover:border-primary/30",
        isOverlay &&
          "cursor-grabbing shadow-xl ring-2 ring-primary/50 rotate-1 scale-105 bg-card/95 backdrop-blur-sm"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab text-muted-foreground hover:text-foreground",
          isOverlay && "cursor-grabbing"
        )}
      >
        <GripVertical className="size-4" />
      </div>

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

      {/* Actions - ẩn khi overlay */}
      {!isOverlay && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 group-hover:opacity-100"
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
      )}
    </div>
  );
});

// Component sortable chính
export default function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
    data: {
      type: "item",
      item: props.item,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <SortableItemContent
      {...props}
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      style={style}
      isDragging={isDragging}
    />
  );
}
