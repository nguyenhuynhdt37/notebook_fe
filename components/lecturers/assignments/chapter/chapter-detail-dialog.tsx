"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import api from "@/api/client/axios";
import { Chapter } from "@/types/lecturer/chapter";
import TiptapEditor from "@/components/shared/tiptap_editor";
import LessonList from "./lesson/lesson-list";

interface ChapterDetailDialogProps {
  chapter: Chapter | null;
  assignmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedChapter: Chapter) => void;
}

export function ChapterDetailDialog({
  chapter,
  assignmentId,
  isOpen,
  onClose,
  onUpdate,
}: ChapterDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setDescription(chapter.description || "");
    }
  }, [chapter]);

  const handleSave = async () => {
    if (!chapter) return;
    if (!title.trim()) {
      toast.error("Tên chương không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put<Chapter>(`/lecturer/chapters/${chapter.id}`, {
        title,
        description,
      });

      onUpdate(res.data);
      toast.success("Đã cập nhật chương học");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật chương học");
    } finally {
      setIsSaving(false);
    }
  };

  if (!chapter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết chương học</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin chi tiết cho chương này
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Tên chương</Label>
            <Input
              id="chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên chương..."
            />
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <div className="min-h-[200px] rounded-md border">
              <TiptapEditor
                value={description}
                onChange={setDescription}
                placeholder="Thêm mô tả chi tiết cho chương này..."
                minHeight="200px"
              />
            </div>
          </div>

          <Separator />

          {/* Lessons / Items */}
          <div className="space-y-2">
            <Label>Nội dung bài học</Label>
            <LessonList chapterId={chapter.id} assignmentId={assignmentId} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
