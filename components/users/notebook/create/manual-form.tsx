"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookResponse } from "@/types/user/notebook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ManualForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 5MB");
      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return false;
    }
    if (title.length > 255) {
      toast.error("Tiêu đề tối đa 255 ký tự");
      return false;
    }
    if (description.length > 5000) {
      toast.error("Mô tả tối đa 5000 ký tự");
      return false;
    }
    if (!thumbnail) {
      toast.error("Vui lòng tải lên ảnh bìa");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();

      const data = {
        title: title.trim(),
        description: description.trim() || null,
        autoGenerate: false,
      };
      formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      formData.append("thumbnail", thumbnail!);

      const response = await api.post<NotebookResponse>(
        "/user/personal-notebooks",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Tạo notebook thành công!");
      router.push(`/notebook/${response.data.id}/workspace`);
    } catch (error: any) {
      console.error("Error creating notebook:", error);
      const message = error.response?.data?.message || "Không thể tạo notebook";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Nhập tiêu đề notebook"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">{title.length}/255</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Nhập mô tả cho notebook (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={4}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          {description.length}/5000
        </p>
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>
          Ảnh bìa <span className="text-red-500">*</span>
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="hidden"
        />
        {thumbnailPreview ? (
          <div className="relative w-full aspect-video rounded-lg border overflow-hidden bg-muted">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeThumbnail}
              disabled={isLoading}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/50"
          >
            <ImageIcon className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Nhấn để tải lên ảnh bìa</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP (tối đa 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Đang tạo...
          </>
        ) : (
          "Tạo Notebook"
        )}
      </Button>
    </form>
  );
}
