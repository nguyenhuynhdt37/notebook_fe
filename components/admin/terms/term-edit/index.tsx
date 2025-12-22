"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { TermDetailResponse, UpdateTermRequest } from "@/types/admin/term";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TermEditProps {
  termId: string;
}

export default function TermEdit({ termId }: TermEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<UpdateTermRequest>({
    code: "",
    name: "",
    startDate: undefined,
    endDate: undefined,
    isActive: true,
  });

  useEffect(() => {
    const loadTerm = async () => {
      try {
        const response = await api.get<TermDetailResponse>(
          `/admin/term/${termId}`
        );
        const term = response.data;
        setFormData({
          code: term.code,
          name: term.name,
          startDate: term.startDate || undefined,
          endDate: term.endDate || undefined,
          isActive: term.isActive,
        });
      } catch {
        toast.error("Không thể tải thông tin học kỳ");
        router.push("/admin/terms");
      } finally {
        setIsFetching(false);
      }
    };
    loadTerm();
  }, [termId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code?.trim() || !formData.name?.trim()) {
      toast.error("Vui lòng nhập mã và tên học kỳ");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/admin/term/${termId}`, formData);
      toast.success("Cập nhật học kỳ thành công");
      router.push("/admin/terms");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 404) {
        toast.error("Không tìm thấy học kỳ");
      } else if (status === 409) {
        toast.error("Mã học kỳ mới đã tồn tại");
      } else {
        toast.error(err.response?.data?.message || "Không thể cập nhật học kỳ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="max-w-2xl h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/terms">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa học kỳ
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin học kỳ
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin học kỳ</CardTitle>
          <CardDescription>Chỉnh sửa thông tin học kỳ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã học kỳ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: 2024_HK1, 2024_HK2_1..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Format: NĂM_HKx hoặc NĂM_HKx_y (VD: 2024_HK1, 2024_HK2_1)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên học kỳ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Học kỳ 1 năm học 2024-2025..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  maxLength={255}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value || undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                <p className="text-sm text-muted-foreground">
                  Học kỳ này có đang hoạt động không?
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Cập nhật
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/terms">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
