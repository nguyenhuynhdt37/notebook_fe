"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookAdminResponse } from "@/types/admin/notebook";
import TiptapEditor from "@/components/shared/tiptap_editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NotebookEditProps {
  notebookId: string;
}

interface OriginalData {
  title: string;
  description: string;
  visibility: "public" | "private";
  thumbnailUrl: string | null;
}

export default function NotebookEdit({ notebookId }: NotebookEditProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Original data để so sánh
  const [original, setOriginal] = useState<OriginalData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotebook, setIsLoadingNotebook] = useState(true);

  useEffect(() => {
    loadNotebook();
  }, [notebookId]);

  const loadNotebook = async () => {
    setIsLoadingNotebook(true);
    try {
      const { data } = await api.get<NotebookAdminResponse>(
        `/admin/community/${notebookId}`
      );
      setTitle(data.title);
      setDescription(data.description || "");
      setVisibility(data.visibility);
      setPreview(data.thumbnailUrl);
      setOriginal({
        title: data.title,
        description: data.description || "",
        visibility: data.visibility,
        thumbnailUrl: data.thumbnailUrl,
      });
    } catch {
      toast.error("Không thể tải thông tin notebook");
      router.push("/admin/notebooks");
    } finally {
      setIsLoadingNotebook(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setThumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setThumbnail(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Check có thay đổi gì không
  const hasChanges = () => {
    if (!original) return false;
    return (
      title.trim() !== original.title ||
      description.trim() !== original.description ||
      visibility !== original.visibility ||
      thumbnail !== null // Có upload ảnh mới
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!title.trim()) {
      toast.error("Tiêu đề là bắt buộc");
      return;
    }
    if (!description.trim()) {
      toast.error("Mô tả là bắt buộc");
      return;
    }
    if (!preview) {
      toast.error("Ảnh đại diện là bắt buộc");
      return;
    }

    // Check thay đổi
    if (!hasChanges()) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("visibility", visibility);
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await api.put(`/admin/community/${notebookId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Cập nhật notebook thành công");
      router.push("/admin/notebooks");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật notebook"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingNotebook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa notebook
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Cập nhật thông tin notebook trong hệ thống
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin notebook</CardTitle>
          <CardDescription className="mt-1">
            Cập nhật thông tin notebook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả <span className="text-destructive">*</span>
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <TiptapEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Nhập mô tả cho notebook..."
                  minHeight="200px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">
                Hiển thị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={visibility}
                onValueChange={(v: "public" | "private") => setVisibility(v)}
                disabled={isLoading}
              >
                <SelectTrigger id="visibility" className="h-9">
                  <SelectValue placeholder="Chọn hiển thị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Công khai</SelectItem>
                  <SelectItem value="private">Riêng tư</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">
                Ảnh đại diện <span className="text-destructive">*</span>
              </Label>
              {preview ? (
                <div className="relative w-full aspect-video rounded-lg border overflow-hidden bg-muted">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 size-8"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Upload className="size-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click để chọn ảnh hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, JPEG
                  </p>
                </div>
              )}
              <Input
                ref={fileInputRef}
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" disabled={isLoading || !hasChanges()}>
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
