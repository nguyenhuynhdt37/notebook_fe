"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FileUploadProps {
  notebookId: string;
  onSuccess: () => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export default function FileUpload({ notebookId, onSuccess }: FileUploadProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      return (
        ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(file.type)
      );
    });

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Chỉ chấp nhận file PDF và Word (.doc, .docx)");
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Vui lòng chọn ít nhất một file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      await api.post(`/user/notebooks/${notebookId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Đã tải lên ${files.length} file thành công`);
      setFiles([]);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tải file lên";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="size-4" />
          Thêm file
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tải file lên</DialogTitle>
          <DialogDescription>
            Chọn file PDF hoặc Word để thêm vào notebook
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Upload className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click để chọn file hoặc kéo thả vào đây
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                >
                  <FileText className="size-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                `Tải lên ${files.length > 0 ? `(${files.length})` : ""}`
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
