"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, FileText } from "lucide-react";
import api from "@/api/client/axios";
import { ChapterItem } from "@/types/lecturer/chapter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LessonItem from "./lesson-item";

interface LessonListProps {
  chapterId: string;
  assignmentId: string;
}

export default function LessonList({
  chapterId,
  assignmentId,
}: LessonListProps) {
  const router = useRouter();
  const [items, setItems] = useState<ChapterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [chapterId]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ChapterItem[]>(
        `/lecturer/chapters/${chapterId}/items`
      );
      const sorted = [...res.data].sort((a, b) => a.sortOrder - b.sortOrder);
      setItems(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;

    const previousItems = [...items];
    setItems(items.filter((i) => i.id !== itemId));

    try {
      await api.delete(`/lecturer/chapter-items/${itemId}`);
      toast.success("Đã xóa bài học");
    } catch (error) {
      toast.error("Không thể xóa bài học");
      setItems(previousItems);
    }
  };

  const handleAddLesson = () => {
    router.push(
      `/lecturer/assignments/${assignmentId}/chapters/${chapterId}/lessons/create`
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Chưa có bài học nào</p>
          <p className="text-xs text-muted-foreground mb-4">
            Thêm tài liệu, video, hoặc bài trắc nghiệm
          </p>
          <Button size="sm" onClick={handleAddLesson}>
            <Plus className="mr-2 size-4" />
            Thêm bài học
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <LessonItem
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
                onPreview={() => {
                  if (item.metadata.storageUrl) {
                    window.open(item.metadata.storageUrl, "_blank");
                  }
                }}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddLesson}
          >
            <Plus className="mr-2 size-4" />
            Thêm bài học
          </Button>
        </>
      )}
    </div>
  );
}
