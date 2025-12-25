"use client";

import { useState, useRef } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { UploadedImage } from "@/types/user/regulation-chat";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, images?: UploadedImage[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Nhập câu hỏi của bạn...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    if (uploadedImages.length + files.length > 3) {
      toast.error("Tối đa 3 ảnh");
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("files", file));

      const response = await api.post<UploadedImage[]>(
        "/user/regulation/chat/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedImages((prev) => [...prev, ...response.data]);
      toast.success(`Đã tải ${validFiles.length} ảnh`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Không thể tải ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleUpload(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && uploadedImages.length < 3) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || uploadedImages.length >= 3) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSend = () => {
    if ((!input.trim() && uploadedImages.length === 0) || disabled || isLoading)
      return;
    onSend(
      input.trim(),
      uploadedImages.length > 0 ? uploadedImages : undefined
    );
    setInput("");
    setUploadedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t">
      <div className="p-4">
        <div className="space-y-3">
          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="flex gap-2">
              {uploadedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group h-20 w-20 rounded-md border overflow-hidden bg-muted"
                >
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_URL_BACKEND ||
                      "http://localhost:8386"
                    }${img.fileUrl}`}
                    alt={img.fileName}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Container */}
          <div
            className={cn(
              "relative flex items-end gap-2 rounded-lg border bg-background p-2 transition-colors",
              isDragging && "border-primary bg-accent",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-accent/50">
                <div className="text-center">
                  <ImagePlus className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm font-medium">Thả ảnh vào đây</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading || uploadedImages.length >= 3}
              className="h-10 w-10 shrink-0"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="sr-only">Tải ảnh</span>
            </Button>

            {/* Textarea */}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={disabled ? "Vui lòng chọn tài liệu..." : placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[160px] resize-none border-0 p-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={
                (!input.trim() && uploadedImages.length === 0) ||
                isLoading ||
                disabled ||
                isUploading
              }
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Gửi</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <p>
              {uploadedImages.length > 0 && (
                <span className="font-medium text-foreground">
                  {uploadedImages.length}/3 ảnh •{" "}
                </span>
              )}
              <span className="hidden sm:inline">Enter gửi • </span>
              Shift+Enter xuống dòng
            </p>
            <p className="hidden sm:block">AI có thể mắc lỗi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
