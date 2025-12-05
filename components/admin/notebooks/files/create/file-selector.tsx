"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileSelectorProps {
  onFilesChange: (files: File[]) => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
}

export default function FileSelector({
  onFilesChange,
  onError,
  disabled,
}: FileSelectorProps) {
  const [files, setFiles] = useState<File[]>([]);

  const validateFiles = (fileList: File[]): string | null => {
    if (fileList.length === 0) {
      return "Vui lòng chọn ít nhất một file";
    }

    for (const file of fileList) {
      const filename = file.name.toLowerCase();
      const isValid =
        filename.endsWith(".pdf") ||
        filename.endsWith(".doc") ||
        filename.endsWith(".docx");

      if (!isValid) {
        return `File không hợp lệ: ${file.name}. Chỉ chấp nhận PDF và Word files.`;
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      const validationError = validateFiles(fileList);
      if (validationError) {
        onError(validationError);
        setFiles([]);
        onFilesChange([]);
        return;
      }
      setFiles(fileList);
      onFilesChange(fileList);
      onError(null);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-input">Chọn files</Label>
      <div className="flex items-center gap-2">
        <Input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-2 mt-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="size-4 shrink-0" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

