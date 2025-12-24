"use client";

import {
  closestCorners,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Chapter, ChapterItem } from "@/types/lecturer/chapter";
import SectionColumn, { SectionColumnItem } from "./section-column";
import { SortableItemContent } from "./lesson/sortable-item";
import CreateSectionCard from "./create-section-card";
import api from "@/api/client/axios";
import { LecturerAssignmentResponse } from "@/types/lecturer/assignment";
import { ChapterDetailDialog } from "./chapter-detail-dialog";
import { DeleteItemDialog } from "./delete-item-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Columns, Rows } from "lucide-react";

interface ChapterBoardProps {
  courseId: string;
}

type ViewMode = "horizontal" | "vertical";

export default function ChapterBoard({ courseId }: ChapterBoardProps) {
  // --- STATE ---
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("horizontal");

  // Detail Sheet State
  const [editingChapterDetails, setEditingChapterDetails] =
    useState<Chapter | null>(null);

  // Delete Dialog State
  const [deletingItem, setDeletingItem] = useState<{
    item: ChapterItem;
    chapterId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA ---
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const assignRes = await api.get<LecturerAssignmentResponse>(
        `/lecturer/teaching-assignments/${courseId}`
      );
      const nbId = assignRes.data.notebookId;
      setNotebookId(nbId);

      if (nbId) {
        const chaptersRes = await api.get<Chapter[]>(
          `/lecturer/notebooks/${nbId}/chapters`
        );
        const sorted = [...chaptersRes.data].sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        setChapters(sorted);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu chương học");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"chapter" | "item" | null>(null);
  const [activeItem, setActiveItem] = useState<ChapterItem | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const lastMoveRef = useRef<{
    fromChapterId: string;
    toChapterId: string;
    itemId: string;
    moveKey: string;
  } | null>(null);

  // Edit/Create State
  const [isEditingSection, setIsEditingSection] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");

  // --- SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // --- HANDLERS: DETAILS SHEET ---
  const handleChapterDetailsUpdated = (updatedChapter: Chapter) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === updatedChapter.id
          ? { ...c, ...updatedChapter, items: c.items }
          : c
      )
    );
  };

  // --- HANDLERS: SECTION (CHAPTER) ---
  const handleCreateSection = async (title: string) => {
    if (!notebookId) return;

    const tempId = `temp-${Date.now()}`;
    const newChapter: Chapter = {
      id: tempId,
      title,
      description: null,
      sortOrder: chapters.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };

    setChapters([...chapters, newChapter]);

    try {
      const res = await api.post<Chapter>(
        `/lecturer/notebooks/${notebookId}/chapters`,
        { title }
      );
      setChapters((prev) =>
        prev.map((c) => (c.id === tempId ? { ...res.data, items: [] } : c))
      );
      toast.success("Đã tạo chương mới");
    } catch {
      toast.error("Lỗi khi tạo chương");
      setChapters((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const handleUpdateSection = async () => {
    if (!isEditingSection || !editSectionTitle.trim()) return;

    const previousChapters = [...chapters];
    setChapters(
      chapters.map((s) =>
        s.id === isEditingSection ? { ...s, title: editSectionTitle } : s
      )
    );

    const chapterId = isEditingSection;
    setIsEditingSection(null);
    setEditSectionTitle("");

    try {
      await api.put(`/lecturer/chapters/${chapterId}`, {
        title: editSectionTitle,
      });
      toast.success("Đã cập nhật tên chương");
    } catch {
      toast.error("Lỗi cập nhật");
      setChapters(previousChapters);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const section = chapters.find((s) => s.id === sectionId);
    if (!section) return;
    if (section.items && section.items.length > 0) {
      toast.error("Không thể xóa chương có nội dung");
      return;
    }

    if (confirm("Bạn có chắc muốn xóa chương này?")) {
      const previousChapters = [...chapters];
      setChapters(chapters.filter((s) => s.id !== sectionId));

      try {
        await api.delete(`/lecturer/chapters/${sectionId}`);
        toast.success("Đã xóa chương");
      } catch {
        toast.error("Lỗi xóa chương");
        setChapters(previousChapters);
      }
    }
  };

  // --- HANDLERS: ITEM DELETE (via Dialog) ---
  const handleDeleteItemRequest = (chapterId: string, itemId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const item = chapter?.items?.find((i) => i.id === itemId);
    if (item) {
      setDeletingItem({ item, chapterId });
    }
  };

  const handleDeleteItemConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    const { item, chapterId } = deletingItem;
    const previousChapters = [...chapters];

    // Optimistic update
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? { ...c, items: (c.items || []).filter((i) => i.id !== item.id) }
          : c
      )
    );

    try {
      await api.delete(`/lecturer/chapters/${chapterId}/items/${item.id}`);
      toast.success("Đã xóa nội dung");
      setDeletingItem(null);
    } catch {
      toast.error("Không thể xóa nội dung");
      setChapters(previousChapters);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- DnD LOGIC ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = String(active.id);
    lastMoveRef.current = null;

    const chapter = chapters.find((s) => s.id === activeIdStr);
    if (chapter) {
      setActiveId(activeIdStr);
      setActiveType("chapter");
      setActiveChapter(chapter);
      setActiveItem(null);
      return;
    }

    for (const ch of chapters) {
      const item = (ch.items || []).find((i) => i.id === activeIdStr);
      if (item) {
        setActiveId(activeIdStr);
        setActiveType("item");
        setActiveItem(item);
        setActiveChapter(null);
        return;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || activeType !== "item") return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    setChapters((currentChapters) => {
      // Find chapter containing the active item
      const activeChapter = currentChapters.find((c) =>
        (c.items || []).some((i) => i.id === activeIdStr)
      );
      if (!activeChapter) return currentChapters;

      // Find target chapter
      let overChapter: Chapter | undefined;
      let overItemId: string | null = null;

      // Check if hovering over a chapter directly
      overChapter = currentChapters.find((c) => c.id === overIdStr);

      // Check if hovering over an item
      if (!overChapter) {
        overChapter = currentChapters.find((c) =>
          (c.items || []).some((i) => i.id === overIdStr)
        );
        if (overChapter) {
          overItemId = overIdStr;
        }
      }

      // Check if hovering over droppable zone
      if (!overChapter && overIdStr.startsWith("section-droppable-")) {
        const sectionId = overIdStr.replace("section-droppable-", "");
        overChapter = currentChapters.find((c) => c.id === sectionId);
      }

      // Skip if same chapter or no target found
      if (!overChapter || activeChapter.id === overChapter.id) {
        return currentChapters;
      }

      // Skip if this exact move was already done
      const moveKey = `${activeChapter.id}->${overChapter.id}:${activeIdStr}`;
      if (lastMoveRef.current?.moveKey === moveKey) {
        return currentChapters;
      }
      lastMoveRef.current = {
        fromChapterId: activeChapter.id,
        toChapterId: overChapter.id,
        itemId: activeIdStr, // Actual item UUID
        moveKey: moveKey, // For duplicate detection
      };

      // Get the item to move
      const activeItems = activeChapter.items || [];
      const activeIndex = activeItems.findIndex((i) => i.id === activeIdStr);
      if (activeIndex === -1) return currentChapters;

      const movedItem = activeItems[activeIndex];
      const overItems = overChapter.items || [];

      // Calculate insert index
      let insertIndex = overItems.length; // Default: end
      if (overItemId) {
        const overIndex = overItems.findIndex((i) => i.id === overItemId);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      // Perform the move
      return currentChapters.map((c) => {
        if (c.id === activeChapter.id) {
          return {
            ...c,
            items: activeItems.filter((i) => i.id !== activeIdStr),
          };
        }
        if (c.id === overChapter!.id) {
          const newItems = [...overItems];
          newItems.splice(insertIndex, 0, movedItem);
          return { ...c, items: newItems };
        }
        return c;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Chapter reorder
    if (activeType === "chapter") {
      const activeIndex = chapters.findIndex((s) => s.id === activeIdStr);
      const overIndex = chapters.findIndex((s) => s.id === overIdStr);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newChapters = arrayMove(chapters, activeIndex, overIndex);
        setChapters(newChapters);

        if (notebookId) {
          try {
            await api.put(
              `/lecturer/notebooks/${notebookId}/chapters/reorder`,
              {
                orderedIds: newChapters.map((c) => c.id),
              }
            );
          } catch {
            toast.error("Lỗi lưu thứ tự chương");
          }
        }
      }
    }
    // Item reorder/move
    else if (activeType === "item") {
      // Find current chapter containing the item
      const currentChapter = chapters.find((c) =>
        (c.items || []).some((i) => i.id === activeIdStr)
      );

      if (!currentChapter) {
        resetDragState();
        return;
      }

      const items = currentChapter.items || [];
      const itemIndex = items.findIndex((i) => i.id === activeIdStr);

      // Check if cross-chapter move happened (tracked by lastMoveRef)
      if (lastMoveRef.current) {
        const { fromChapterId, toChapterId, itemId } = lastMoveRef.current;

        // Call Move API for cross-chapter
        try {
          await api.patch(
            `/lecturer/chapters/${fromChapterId}/items/${itemId}/move`,
            {
              targetChapterId: toChapterId,
              targetIndex: itemIndex >= 0 ? itemIndex : null,
            }
          );
        } catch {
          toast.error("Lỗi di chuyển nội dung");
          loadData(); // Reload to sync
        }
      } else {
        // Same chapter reorder - use functional setState for latest state
        setChapters((currentChapters) => {
          // Find chapter containing the active item
          const sourceChapter = currentChapters.find((c) =>
            (c.items || []).some((i) => i.id === activeIdStr)
          );
          if (!sourceChapter) return currentChapters;

          // Find target chapter (by item ID, chapter ID, or droppable ID)
          let targetChapter: Chapter | undefined;
          targetChapter = currentChapters.find((c) => c.id === overIdStr);
          if (!targetChapter) {
            targetChapter = currentChapters.find((c) =>
              (c.items || []).some((i) => i.id === overIdStr)
            );
          }
          if (!targetChapter && overIdStr.startsWith("section-droppable-")) {
            const sectionId = overIdStr.replace("section-droppable-", "");
            targetChapter = currentChapters.find((c) => c.id === sectionId);
          }

          // Only reorder if same chapter
          if (!targetChapter || sourceChapter.id !== targetChapter.id) {
            return currentChapters;
          }

          const items = sourceChapter.items || [];
          const activeIndex = items.findIndex((i) => i.id === activeIdStr);
          const overIndex = items.findIndex((i) => i.id === overIdStr);

          // If overIdStr is not an item but a droppable zone, skip reorder
          // (item was dropped on empty space, position stays as-is)
          if (activeIndex === -1 || overIndex === -1) {
            return currentChapters;
          }

          if (activeIndex === overIndex) {
            return currentChapters;
          }

          const newItems = arrayMove(items, activeIndex, overIndex);

          // API call for reorder (async, outside setState)
          api
            .patch(`/lecturer/chapters/${sourceChapter.id}/items/reorder`, {
              orderedIds: newItems.map((i) => i.id),
            })
            .catch(() => {
              toast.error("Lỗi lưu thứ tự nội dung");
            });

          return currentChapters.map((c) =>
            c.id === sourceChapter.id ? { ...c, items: newItems } : c
          );
        });
      }
    }

    resetDragState();
  };

  const resetDragState = () => {
    setActiveId(null);
    setActiveType(null);
    setActiveItem(null);
    setActiveChapter(null);
    lastMoveRef.current = null;
  };

  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      if (activeType === "item") {
        const p = pointerWithin(args);
        if (p.length > 0) return p;
      }
      return closestCorners(args);
    },
    [activeType]
  );

  if (isLoading)
    return <div className="p-10 flex justify-center">Loading Data...</div>;
  if (!notebookId && !isLoading)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Không tìm thấy Notebook cho môn học này.
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
      {/* View Toggle */}
      <div className="flex justify-end p-2 px-4 gap-2 border-b bg-background z-10 shrink-0">
        <div className="flex bg-muted rounded-md p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("horizontal")}
            className={cn(
              "h-7 px-2 text-xs",
              viewMode === "horizontal"
                ? "bg-background shadow-sm hover:bg-background"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Columns className="mr-1 size-3.5" />
            Ngang
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("vertical")}
            className={cn(
              "h-7 px-2 text-xs",
              viewMode === "vertical"
                ? "bg-background shadow-sm hover:bg-background"
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <Rows className="mr-1 size-3.5" />
            Dọc
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            "flex flex-1 gap-6 p-4 pb-8",
            viewMode === "horizontal"
              ? "overflow-x-auto flex-row"
              : "overflow-y-auto flex-col max-w-3xl mx-auto w-full"
          )}
        >
          <SortableContext
            items={chapters.map((s) => s.id)}
            strategy={
              viewMode === "horizontal"
                ? horizontalListSortingStrategy
                : verticalListSortingStrategy
            }
          >
            {chapters.map((chapter) => (
              <SectionColumn
                key={chapter.id}
                chapter={chapter}
                assignmentId={courseId}
                onEditDetails={() => setEditingChapterDetails(chapter)}
                isEditing={isEditingSection === chapter.id}
                editTitle={editSectionTitle}
                onEditTitleChange={setEditSectionTitle}
                onStartEdit={() => {
                  setIsEditingSection(chapter.id);
                  setEditSectionTitle(chapter.title);
                }}
                onCancelEdit={() => {
                  setIsEditingSection(null);
                  setEditSectionTitle("");
                }}
                onSaveEdit={handleUpdateSection}
                onDelete={() => handleDeleteSection(chapter.id)}
                onDeleteItem={(itemId) =>
                  handleDeleteItemRequest(chapter.id, itemId)
                }
                activeType={activeType}
                activeId={activeId}
                overSectionId={null}
                overLessonId={null}
                viewMode={viewMode}
              />
            ))}
          </SortableContext>

          <CreateSectionCard
            onCreate={handleCreateSection}
            viewMode={viewMode}
          />
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeType === "chapter" && activeChapter ? (
            <SectionColumnItem
              chapter={activeChapter}
              assignmentId={courseId}
              isEditing={false}
              editTitle=""
              onEditTitleChange={() => {}}
              onStartEdit={() => {}}
              onCancelEdit={() => {}}
              onSaveEdit={() => {}}
              onDelete={() => {}}
              onDeleteItem={() => {}}
              onEditDetails={() => {}}
              activeType="chapter"
              activeId={activeChapter.id}
              overSectionId={null}
              overLessonId={null}
              isOverlay
              viewMode={viewMode}
            />
          ) : null}
          {activeType === "item" && activeItem ? (
            <SortableItemContent item={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ChapterDetailDialog
        chapter={editingChapterDetails}
        assignmentId={courseId}
        isOpen={!!editingChapterDetails}
        onClose={() => setEditingChapterDetails(null)}
        onUpdate={handleChapterDetailsUpdated}
        onReload={loadData}
      />

      <DeleteItemDialog
        item={deletingItem?.item || null}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteItemConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
