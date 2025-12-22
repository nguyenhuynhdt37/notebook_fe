"use client";

import { useRouter } from "next/navigation";

import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash,
  Pencil,
  FileText,
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
import { cn } from "@/lib/utils";
import { Chapter, ChapterItem } from "@/types/lecturer/chapter";
import SortableItem from "./lesson/sortable-item";
import React from "react";

interface SectionColumnProps {
  chapter: Chapter;
  assignmentId: string;
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onDeleteItem: (itemId: string) => void;
  onEditDetails: () => void;
  overSectionId: string | null;
  overLessonId: string | null;
  activeId: string | null;
  activeType: "chapter" | "item" | null;
  viewMode?: "horizontal" | "vertical";
}

interface SectionColumnItemProps extends SectionColumnProps {
  setNodeRef?: (node: HTMLElement | null) => void;
  attributes?: React.HTMLAttributes<HTMLElement>;
  listeners?: React.HTMLAttributes<HTMLElement>;
  style?: React.CSSProperties;
  isDragging?: boolean;
  isOverlay?: boolean;
}

// Wrapper component for each sortable item - stabilizes callbacks
const ItemWrapper = React.memo(function ItemWrapper({
  item,
  onDeleteItem,
}: {
  item: ChapterItem;
  onDeleteItem: (itemId: string) => void;
}) {
  const handleDelete = React.useCallback(() => {
    onDeleteItem(item.id);
  }, [item.id, onDeleteItem]);

  const handlePreview = React.useCallback(() => {
    if (item.metadata.storageUrl) {
      window.open(item.metadata.storageUrl, "_blank");
    }
  }, [item.metadata.storageUrl]);

  return (
    <SortableItem
      item={item}
      onDelete={handleDelete}
      onPreview={handlePreview}
    />
  );
});

export const SectionColumnItem = React.memo(function SectionColumnItem({
  chapter,
  assignmentId,
  isEditing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onDeleteItem,
  onEditDetails,
  setNodeRef,
  attributes,
  listeners,
  style,
  isDragging,
  isOverlay,
  viewMode = "horizontal",
}: SectionColumnItemProps) {
  const router = useRouter();

  // Use items in array order
  const items = chapter.items || [];
  const itemIds = React.useMemo(() => items.map((i) => i.id), [items]);

  const handleAddLesson = React.useCallback(() => {
    router.push(
      `/lecturer/assignments/${assignmentId}/chapters/${chapter.id}/lessons/create`
    );
  }, [router, assignmentId, chapter.id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex shrink-0 flex-col rounded-xl border bg-muted/40",
        viewMode === "horizontal" ? "w-80 h-full" : "w-full",
        isDragging && "opacity-50 ring-2 ring-primary",
        isOverlay &&
          "cursor-grabbing shadow-xl ring-2 ring-primary rotate-2 opacity-90 bg-muted"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        {isEditing ? (
          <div className="w-full space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="h-8 bg-background font-medium"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                className="h-7 text-xs"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                disabled={!editTitle.trim()}
                className="h-7 text-xs"
              >
                Lưu
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "flex flex-1 items-center gap-2 cursor-grab active:cursor-grabbing group",
                isOverlay && "cursor-grabbing"
              )}
            >
              <GripVertical className="size-4 text-muted-foreground" />
              <h3 className="font-semibold leading-none tracking-tight">
                {chapter.title}
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border">
                {items.length}
              </span>
            </div>

            {!isOverlay && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEditDetails}>
                    <FileText className="mr-2 size-4" />
                    Chi tiết chương
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onStartEdit}>
                    <Pencil className="mr-2 size-4" />
                    Đổi tên nhanh
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 size-4" />
                    Xóa chương
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>

      {/* Content - Sortable Items */}
      <div
        className={cn(
          "flex-1 px-3 pb-3",
          viewMode === "horizontal" ? "overflow-y-auto" : ""
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[50px]">
            {items.map((item) => (
              <ItemWrapper
                key={item.id}
                item={item}
                onDeleteItem={onDeleteItem}
              />
            ))}

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-6 text-muted-foreground border-muted-foreground/20">
                <p className="text-sm">Chưa có nội dung</p>
              </div>
            )}
          </div>
        </SortableContext>

        {!isOverlay && (
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleAddLesson}
          >
            <Plus className="mr-2 size-4" />
            Thêm bài học
          </Button>
        )}
      </div>
    </div>
  );
});

export default function SectionColumn(props: SectionColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.chapter.id,
    data: { type: "chapter", chapter: props.chapter },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `section-droppable-${props.chapter.id}`,
    data: { type: "chapter", chapterId: props.chapter.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const setCombinedRef = React.useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      setDroppableRef(node);
    },
    [setNodeRef, setDroppableRef]
  );

  return (
    <SectionColumnItem
      {...props}
      setNodeRef={setCombinedRef}
      attributes={attributes}
      listeners={listeners}
      style={style}
      isDragging={isDragging}
    />
  );
}
