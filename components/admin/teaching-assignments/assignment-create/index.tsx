"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { CreateAssignmentRequest } from "@/types/admin/teaching-assignment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import TermSelect from "../../shared/term-select";
import SubjectSelect from "../../shared/subject-select";
import LecturerSelect from "../../shared/lecturer-select";
import MajorSelect from "../../shared/major-select";
import TiptapEditor from "@/components/shared/tiptap_editor";

export default function AssignmentCreate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [majorId, setMajorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAssignmentRequest>({
    termId: "",
    subjectId: "",
    teacherUserId: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termId || !formData.subjectId || !formData.teacherUserId) {
      toast.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/admin/teaching-assignments", formData);
      toast.success("Tạo phân công thành công");
      router.push("/admin/teaching-assignments");
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast.error(message || "Không thể tạo phân công");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/teaching-assignments">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thêm phân công mới
          </h1>
          <p className="text-muted-foreground mt-1">
            Phân công giảng viên cho môn học trong học kỳ
          </p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Thông tin phân công</CardTitle>
          <CardDescription>Các trường có dấu (*) là bắt buộc</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="term">
                  Học kỳ <span className="text-destructive">*</span>
                </Label>
                <TermSelect
                  value={formData.termId}
                  onChange={(val) =>
                    setFormData({ ...formData, termId: val || "" })
                  }
                  placeholder="Chọn học kỳ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Ngành học (Lọc môn)</Label>
                <MajorSelect
                  value={majorId}
                  onChange={(val) => {
                    setMajorId(val);
                    setFormData({ ...formData, subjectId: "" }); // Reset subject when major changes
                  }}
                  placeholder="Lọc theo ngành"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Môn học <span className="text-destructive">*</span>
                </Label>
                <SubjectSelect
                  value={formData.subjectId}
                  onChange={(val) =>
                    setFormData({ ...formData, subjectId: val || "" })
                  }
                  placeholder="Chọn môn học"
                  majorId={majorId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">
                  Giảng viên <span className="text-destructive">*</span>
                </Label>
                <LecturerSelect
                  value={formData.teacherUserId}
                  onChange={(val) =>
                    setFormData({ ...formData, teacherUserId: val || "" })
                  }
                  placeholder="Chọn giảng viên"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <div className="min-h-[200px]">
                <TiptapEditor
                  value={formData.note || ""}
                  onChange={(val) =>
                    setFormData({ ...formData, note: val || "" })
                  }
                  placeholder="Nhập ghi chú cho phân công..."
                  minHeight="200px"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Tạo phân công
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/teaching-assignments">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
