"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { RequestTeachingRequest } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LecturerTermSelect from "../../shared/lecturer-term-select";
import LecturerMajorSelect from "../../shared/lecturer-major-select";
import LecturerSubjectSelect from "../../shared/lecturer-subject-select";

export default function RequestTeachingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [majorId, setMajorId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RequestTeachingRequest>({
    termId: "",
    subjectId: "",
    note: "",
  });

  const handleMajorChange = (value: string | null) => {
    setMajorId(value);
    // Reset subject khi đổi ngành
    setFormData((prev) => ({ ...prev, subjectId: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.termId || !formData.subjectId) {
      toast.error("Vui lòng chọn học kỳ và môn học");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/lecturer/assignments/request", {
        termId: formData.termId,
        subjectId: formData.subjectId,
        note: formData.note || undefined,
      });
      toast.success("Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.");
      router.push("/lecturer/assignments");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message;
      toast.error(message || "Không thể gửi yêu cầu");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.termId && formData.subjectId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lecturer/assignments">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Yêu cầu dạy môn
            </h1>
            <p className="text-muted-foreground">
              Gửi yêu cầu đăng ký dạy một môn trong học kỳ
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin yêu cầu</CardTitle>
          <CardDescription>
            Các trường có dấu (*) là bắt buộc. Admin sẽ xem xét và phê duyệt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Term Select */}
            <div className="space-y-2">
              <Label>
                Học kỳ <span className="text-destructive">*</span>
              </Label>
              <LecturerTermSelect
                value={formData.termId || null}
                onChange={(val) =>
                  setFormData({ ...formData, termId: val || "" })
                }
                placeholder="Chọn học kỳ muốn dạy"
              />
            </div>

            {/* Major Select - Filter */}
            <div className="space-y-2">
              <Label>Ngành học (lọc môn)</Label>
              <LecturerMajorSelect
                value={majorId}
                onChange={handleMajorChange}
                placeholder="Chọn ngành để lọc môn học"
              />
              <p className="text-xs text-muted-foreground">
                Chọn ngành để thu hẹp danh sách môn học
              </p>
            </div>

            {/* Subject Select */}
            <div className="space-y-2">
              <Label>
                Môn học <span className="text-destructive">*</span>
              </Label>
              <LecturerSubjectSelect
                value={formData.subjectId || null}
                onChange={(val) =>
                  setFormData({ ...formData, subjectId: val || "" })
                }
                majorId={majorId}
                placeholder="Chọn môn học muốn dạy"
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Ghi chú (tùy chọn)</Label>
              <Textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Nhập ghi chú cho Admin xem xét..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !isFormValid}>
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Gửi yêu cầu
              </Button>
              <Button variant="outline" asChild>
                <Link href="/lecturer/assignments">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
