"use client";

import { useState } from "react";
import { FileText, Play, HelpCircle, BookOpen, StickyNote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChapterItem, ChapterItemType } from "@/types/lecturer/chapter";
import { cn } from "@/lib/utils";
import FileUploadForm from "./file-upload-form";

interface AddLessonDialogProps {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemsAdded: (items: ChapterItem[]) => void;
}

type Step = "select" | "form";

const LESSON_TYPES: {
  type: ChapterItemType;
  icon: typeof FileText;
  label: string;
  description: string;
}[] = [
  {
    type: "FILE",
    icon: FileText,
    label: "Tài liệu",
    description: "Upload PDF, Word, PowerPoint",
  },
  {
    type: "VIDEO",
    icon: Play,
    label: "Video",
    description: "Thêm video từ URL (Sắp có)",
  },
  {
    type: "QUIZ",
    icon: HelpCircle,
    label: "Trắc nghiệm",
    description: "Tạo bài kiểm tra (Sắp có)",
  },
  {
    type: "LECTURE",
    icon: BookOpen,
    label: "Bài giảng",
    description: "Soạn bài giảng text (Sắp có)",
  },
  {
    type: "NOTE",
    icon: StickyNote,
    label: "Ghi chú",
    description: "Thêm ghi chú nhanh (Sắp có)",
  },
];

export default function AddLessonDialog({
  chapterId,
  isOpen,
  onClose,
  onItemsAdded,
}: AddLessonDialogProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<ChapterItemType | null>(
    null
  );

  const handleClose = () => {
    setStep("select");
    setSelectedType(null);
    onClose();
  };

  const handleTypeSelect = (type: ChapterItemType) => {
    if (type === "FILE") {
      setSelectedType(type);
      setStep("form");
    }
    // Other types: show coming soon or navigate to form
  };

  const handleSuccess = (items: ChapterItem[]) => {
    onItemsAdded(items);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Thêm bài học" : "Upload tài liệu"}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? "Chọn loại nội dung bạn muốn thêm vào chương"
              : "Kéo thả hoặc chọn file để upload"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="grid gap-2">
            {LESSON_TYPES.map(({ type, icon: Icon, label, description }) => {
              const isAvailable = type === "FILE";
              return (
                <Button
                  key={type}
                  variant="outline"
                  className={cn(
                    "flex items-center justify-start gap-3 h-auto p-4",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleTypeSelect(type)}
                  disabled={!isAvailable}
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {step === "form" && selectedType === "FILE" && (
          <FileUploadForm
            chapterId={chapterId}
            onSuccess={handleSuccess}
            onCancel={() => {
              setStep("select");
              setSelectedType(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
