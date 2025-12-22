"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { CreateSubjectRequest } from "@/types/admin/subject";
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
import AssignmentSection from "./assignment-section";

export default function SubjectCreate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    code: "",
    name: "",
    credit: undefined,
    isActive: true,
    majorAssignments: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng nhập mã và tên môn học");
      return;
    }

    const validAssignments = (formData.majorAssignments || []).filter(
      (a) => a.majorId
    );

    setIsLoading(true);
    try {
      await api.post("/admin/subject", {
        ...formData,
        majorAssignments:
          validAssignments.length > 0 ? validAssignments : undefined,
      });
      toast.success("Tạo môn học thành công");
      router.push("/admin/subjects");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 409) {
        toast.error("Mã môn học đã tồn tại");
      } else {
        toast.error(err.response?.data?.message || "Không thể tạo môn học");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/subjects">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thêm môn học mới
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo mới môn học trong hệ thống
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin môn học</CardTitle>
            <CardDescription>Nhập thông tin cơ bản của môn học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã môn học <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: CS101, IT201..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit">Số tín chỉ</Label>
                <Input
                  id="credit"
                  type="number"
                  min={0}
                  placeholder="VD: 3"
                  value={formData.credit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên môn học <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Nhập môn lập trình..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={255}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">Trạng thái hoạt động</Label>
                <p className="text-sm text-muted-foreground">
                  Môn học này có đang hoạt động không?
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
          </CardContent>
        </Card>

        <AssignmentSection
          value={formData.majorAssignments || []}
          onChange={(assignments) =>
            setFormData({ ...formData, majorAssignments: assignments })
          }
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Tạo môn học
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/subjects">Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
