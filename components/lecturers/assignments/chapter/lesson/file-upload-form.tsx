"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import api from "@/api/client/axios";
import { ChapterItem } from "@/types/lecturer/chapter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadFormProps {
  chapterId: string;
  onSuccess: (items: ChapterItem[]) => void;
  onCancel: () => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx";

export default function FileUploadForm({
  chapterId,
  onSuccess,
  onCancel,
}: FileUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (ACCEPTED_TYPES.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`File không hợp lệ: ${invalidFiles.join(", ")}`);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await api.post<ChapterItem[]>(
        `/lecturer/chapters/${chapterId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(`Đã upload ${res.data.length} file`);
      onSuccess(res.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Không thể upload file";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <Upload className="size-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Kéo thả file vào đây</p>
        <p className="text-xs text-muted-foreground">hoặc click để chọn file</p>
        <p className="text-xs text-muted-foreground mt-2">
          Hỗ trợ: PDF, Word, PowerPoint
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
            >
              <FileText className="size-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
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
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Hủy
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Upload {files.length > 0 && `(${files.length})`}
        </Button>
      </div>
    </div>
  );
}
