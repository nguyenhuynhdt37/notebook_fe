"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  RegulationNotebookResponse,
  UpdateRegulationNotebookRequest,
} from "@/types/admin/regulation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/shared/tiptap_editor";
import { Label } from "@/components/ui/label";

export default function RegulationNotebookEdit() {
  const router = useRouter();
  const [notebook, setNotebook] = useState<RegulationNotebookResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateRegulationNotebookRequest>({
    title: "",
    description: "",
  });

  useEffect(() => {
    loadNotebook();
  }, []);

  const loadNotebook = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<any>("/admin/regulation/notebook");
      const notebookData = response.data.data || response.data;
      setNotebook(notebookData);
      setFormData({
        title: notebookData.title,
        description: notebookData.description || "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải thông tin công văn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Tiêu đề không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      await api.put("/admin/regulation/notebook", formData);
      toast.success("Cập nhật thành công");
      router.push("/admin/regulation");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể cập nhật công văn");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/regulation");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <Card>
          <CardHeader className="pb-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Chỉnh sửa Công văn
        </h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Công văn quy chế chưa được tạo
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent mb-2"
          onClick={() => router.push("/admin/regulation")}
        >
          <ChevronLeft className="size-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Chỉnh sửa Công văn
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Cập nhật thông tin công văn quy chế và văn bản
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Thông tin Công văn</CardTitle>
          <CardDescription className="mt-1.5">
            Chỉnh sửa tiêu đề và mô tả công văn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề công văn"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">Tối đa 255 ký tự</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <TiptapEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Nhập mô tả công văn"
                maxHeight="400px"
              />
              <p className="text-xs text-muted-foreground">Tối đa 1000 ký tự</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
            >
              <X className="size-4" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="size-4" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
