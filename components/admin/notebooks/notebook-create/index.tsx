"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
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

export default function NotebookCreate() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    visibility?: string;
    thumbnail?: string;
  }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setThumbnail(file);
    if (errors.thumbnail) {
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setThumbnail(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!visibility) {
      newErrors.visibility = "Hiển thị là bắt buộc";
    }

    if (!thumbnail) {
      newErrors.thumbnail = "Ảnh đại diện là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      const params = new URLSearchParams({
        title: title.trim(),
        description: description.trim(),
        visibility,
      });

      await api.post(`/admin/community?${params}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Tạo notebook thành công");
      router.push("/admin/notebooks");
    } catch (error: any) {
      console.error("Error creating notebook:", error);
      toast.error(error.response?.data?.message || "Không thể tạo notebook");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo notebook mới
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Thêm notebook mới vào hệ thống
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin notebook</CardTitle>
          <CardDescription className="mt-1">
            Điền thông tin để tạo notebook mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="Nhập tiêu đề"
                required
                disabled={isLoading}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả <span className="text-destructive">*</span>
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <TiptapEditor
                  value={description}
                  onChange={(markdown) => {
                    setDescription(markdown);
                    if (errors.description && markdown.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
                    }
                  }}
                  placeholder="Nhập mô tả cho notebook..."
                  minHeight="200px"
                />
              </div>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-sm font-medium">
                Hiển thị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={visibility}
                onValueChange={(value: "public" | "private") => {
                  setVisibility(value);
                  if (errors.visibility) {
                    setErrors((prev) => ({ ...prev, visibility: undefined }));
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="visibility"
                  className={`h-9 ${
                    errors.visibility ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Chọn hiển thị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Công khai</SelectItem>
                  <SelectItem value="private">Riêng tư</SelectItem>
                </SelectContent>
              </Select>
              {errors.visibility && (
                <p className="text-sm text-destructive">{errors.visibility}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-sm font-medium">
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
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                    errors.thumbnail ? "border-destructive" : ""
                  }`}
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
              {errors.thumbnail && (
                <p className="text-sm text-destructive">{errors.thumbnail}</p>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo notebook"}
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
