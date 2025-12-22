"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Play,
  HelpCircle,
  Code,
  FileText,
  BookOpen,
  GripVertical,
  Pencil,
  Trash,
  MoreVertical,
  Eye,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lesson, LessonType } from "@/types/lecturer/chapter";
import { cn } from "@/lib/utils";
import React from "react";

interface LessonCardProps {
  lesson: Lesson;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onEditLessonDetails: () => void;
  onPreviewLesson: () => void;
  onManageResources: () => void;
  onManageQuiz: () => void;
}

const getLessonIcon = (type: LessonType) => {
  switch (type) {
    case "video":
      return {
        Icon: Play,
        color: "bg-blue-100 text-blue-600",
        border: "border-blue-200",
      };
    case "quiz":
      return {
        Icon: HelpCircle,
        color: "bg-orange-100 text-orange-600",
        border: "border-orange-200",
      };
    case "code":
      return {
        Icon: Code,
        color: "bg-slate-100 text-slate-600",
        border: "border-slate-200",
      };
    case "info":
      return {
        Icon: FileText,
        color: "bg-emerald-100 text-emerald-600",
        border: "border-emerald-200",
      };
    case "article":
      return {
        Icon: BookOpen,
        color: "bg-purple-100 text-purple-600",
        border: "border-purple-200",
      };
    default:
      return {
        Icon: FileText,
        color: "bg-gray-100 text-gray-600",
        border: "border-gray-200",
      };
  }
};

interface LessonItemProps extends LessonCardProps {
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  attributes?: any;
  listeners?: any;
  style?: React.CSSProperties;
  isOverlay?: boolean;
}

export function LessonItem({
  lesson,
  isEditing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditLessonDetails,
  onPreviewLesson,
  onManageResources,
  onManageQuiz,
  isDragging,
  setNodeRef,
  attributes,
  listeners,
  style,
  isOverlay,
}: LessonItemProps) {
  const { Icon, color, border } = getLessonIcon(lesson.lesson_type);

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 opacity-50",
          border
        )}
      >
        <span className="font-medium text-muted-foreground">
          Đang di chuyển...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md",
        isEditing ? "ring-2 ring-primary" : "hover:border-primary/50",
        isOverlay && "cursor-grabbing shadow-xl ring-2 ring-primary rotate-2"
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="h-8 text-sm font-medium"
            placeholder="Tên bài học"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} disabled={!editTitle.trim()}>
              Lưu
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground",
              isOverlay && "cursor-grabbing"
            )}
          >
            <GripVertical className="size-4" />
          </div>

          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              color
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium leading-tight line-clamp-2">
              {lesson.title}
            </p>
          </div>

          {!isOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onStartEdit}>
                  <Pencil className="mr-2 size-4" />
                  Đổi tên
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEditLessonDetails}>
                  <FileText className="mr-2 size-4" />
                  Chi tiết bài học
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPreviewLesson}>
                  <Eye className="mr-2 size-4" />
                  Xem trước
                </DropdownMenuItem>

                {lesson.lesson_type === "video" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onManageResources}>
                      <Paperclip className="mr-2 size-4" />
                      Tài liệu đính kèm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onManageQuiz}>
                      <CheckSquare className="mr-2 size-4" />
                      Câu hỏi trắc nghiệm
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 size-4" />
                  Xóa bài học
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonCard(props: LessonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <LessonItem
      {...props}
      setNodeRef={setNodeRef}
      attributes={attributes}
      listeners={listeners}
      style={style}
      isDragging={isDragging}
    />
  );
}
