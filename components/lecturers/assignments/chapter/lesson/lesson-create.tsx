"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  Play,
  HelpCircle,
  BookOpen,
  StickyNote,
  ArrowLeft,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import { ChapterItem, ChapterItemType } from "@/types/lecturer/chapter";
import YoutubeUploadForm from "./youtube-upload-form";

interface LessonCreateProps {
  assignmentId: string;
  chapterId: string;
}

interface FileUploadItem {
  file: File;
  title: string;
  description: string;
}

const LESSON_TYPES: {
  type: ChapterItemType;
  icon: typeof FileText;
  label: string;
  description: string;
  available: boolean;
}[] = [
  {
    type: "FILE",
    icon: FileText,
    label: "Tài liệu",
    description: "Upload PDF, Word, PowerPoint",
    available: true,
  },
  {
    type: "VIDEO",
    icon: Play,
    label: "Video YouTube",
    description: "Thêm video từ YouTube",
    available: true,
  },
  {
    type: "QUIZ",
    icon: HelpCircle,
    label: "Trắc nghiệm",
    description: "Tạo bài kiểm tra",
    available: false,
  },
  {
    type: "LECTURE",
    icon: BookOpen,
    label: "Bài giảng",
    description: "Soạn bài giảng text",
    available: false,
  },
  {
    type: "NOTE",
    icon: StickyNote,
    label: "Ghi chú",
    description: "Thêm ghi chú nhanh",
    available: false,
  },
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx";
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export default function LessonCreate({
  assignmentId,
  chapterId,
}: LessonCreateProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ChapterItemType | null>(
    null
  );
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validItems: FileUploadItem[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (ACCEPTED_TYPES.includes(file.type)) {
        validItems.push({
          file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension as default title
          description: "",
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`File không hợp lệ: ${invalidFiles.join(", ")}`);
    }

    setFiles((prev) => [...prev, ...validItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileInfo = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();

      files.forEach((item, index) => {
        formData.append("files", item.file);
        if (item.title.trim()) {
          formData.append(`fileInfos[${index}].title`, item.title.trim());
        }
        if (item.description.trim()) {
          formData.append(
            `fileInfos[${index}].description`,
            item.description.trim()
          );
        }
      });

      await api.post<ChapterItem[]>(
        `/lecturer/chapters/${chapterId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(`Đã upload ${files.length} file`);
      handleBack();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Không thể upload file";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm bài học</h1>
          <p className="text-sm text-muted-foreground">
            Chọn loại nội dung và thêm vào chương
          </p>
        </div>
      </div>

      {/* Step 1: Select Type */}
      {!selectedType && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LESSON_TYPES.map(
            ({ type, icon: Icon, label, description, available }) => (
              <Card
                key={type}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                  !available && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => available && setSelectedType(type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  {!available && (
                    <span className="text-xs text-muted-foreground/60 mt-1 block">
                      Sắp có
                    </span>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Step 2: Upload Form (FILE type) */}
      {selectedType === "FILE" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload tài liệu</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                Quay lại
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <Upload className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Kéo thả file vào đây</p>
              <p className="text-xs text-muted-foreground">
                hoặc click để chọn file
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Hỗ trợ: PDF, Word, PowerPoint
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* File List with per-file title/description */}
            {files.length > 0 && (
              <div className="space-y-3">
                <Label>File đã chọn ({files.length})</Label>
                {files.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="size-5 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`title-${index}`} className="text-xs">
                          Tiêu đề
                        </Label>
                        <Input
                          id={`title-${index}`}
                          value={item.title}
                          onChange={(e) =>
                            updateFileInfo(index, "title", e.target.value)
                          }
                          placeholder="Tiêu đề hiển thị"
                          disabled={isUploading}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`desc-${index}`} className="text-xs">
                          Mô tả
                        </Label>
                        <Input
                          id={`desc-${index}`}
                          value={item.description}
                          onChange={(e) =>
                            updateFileInfo(index, "description", e.target.value)
                          }
                          placeholder="Mô tả ngắn (tùy chọn)"
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
              >
                {isUploading && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Upload {files.length > 0 && `(${files.length} file)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: YouTube Form (VIDEO type) */}
      {selectedType === "VIDEO" && (
        <YoutubeUploadForm
          chapterId={chapterId}
          onBack={() => setSelectedType(null)}
          onSuccess={handleBack}
        />
      )}
    </div>
  );
}
