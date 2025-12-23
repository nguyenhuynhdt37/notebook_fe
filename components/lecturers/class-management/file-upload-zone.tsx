"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUploadZone({
  file,
  onFileSelect,
  onFileRemove,
  accept = ".xlsx",
  maxSize = 10,
  className,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver && "border-primary bg-primary/5 scale-[1.02]",
          file && "border-green-500 bg-green-50 dark:bg-green-950/20",
          !file && !isDragOver && "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <FileSpreadsheet className="h-16 w-16 text-green-600" />
                <CheckCircle className="h-6 w-6 text-green-600 absolute -top-1 -right-1 bg-background rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-green-700 dark:text-green-400 text-lg">
                {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} MB • Excel Spreadsheet
              </p>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFileRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa file
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn file khác
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragOver ? "bg-primary/10" : "bg-muted/50"
              )}>
                <Upload className={cn(
                  "h-12 w-12 transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold">
                {isDragOver ? "Thả file vào đây" : "Kéo thả file Excel vào đây"}
              </p>
              <p className="text-muted-foreground">
                hoặc click để chọn file từ máy tính
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Chọn file Excel
            </Button>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center">
        Hỗ trợ file {accept}, tối đa {maxSize}MB. 
        <br />
        Cấu trúc: <span className="font-mono">Mã SV | Họ và tên | Ngày sinh</span>
      </p>
    </div>
  );
}