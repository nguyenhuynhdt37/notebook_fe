"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookAdminResponse } from "@/types/admin/notebook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NotebookEditProps {
  notebookId: string;
}

export default function NotebookEdit({ notebookId }: NotebookEditProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotebook, setIsLoadingNotebook] = useState(true);

  useEffect(() => {
    loadNotebook();
  }, [notebookId]);

  const loadNotebook = async () => {
    setIsLoadingNotebook(true);
    try {
      const response = await api.get<NotebookAdminResponse>(
        `/admin/notebook/${notebookId}`
      );
      setTitle(response.data.title);
      setDescription(response.data.description || "");
    } catch (error) {
      console.error("Error fetching notebook:", error);
      toast.error("Không thể tải thông tin notebook");
      router.push("/admin/notebooks");
    } finally {
      setIsLoadingNotebook(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.put(`/admin/notebook/${notebookId}`, {
        title,
        description,
      });

      toast.success("Cập nhật notebook thành công");
      router.push("/admin/notebooks");
    } catch (error: any) {
      console.error("Error updating notebook:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật notebook"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingNotebook) {
    return (
      <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
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
            Cập nhật thông tin notebook
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thông tin notebook</CardTitle>
          <CardDescription className="mt-1">
            Cập nhật thông tin notebook trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" disabled={isLoading}>
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
