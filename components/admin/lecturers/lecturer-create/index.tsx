"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { CreateLecturerRequest } from "@/types/admin/lecturer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AccountInfoSection from "./account-info-section";
import PersonalInfoSection from "./personal-info-section";
import ProfessionalInfoSection from "./professional-info-section";

export default function LecturerCreate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLecturerRequest>({
    email: "",
    fullName: "",
    password: "",
    lecturerCode: "",
    orgUnitId: undefined,
    academicDegree: undefined,
    academicRank: undefined,
    specialization: "",
    phone: "",
    avatarUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email.trim() ||
      !formData.fullName.trim() ||
      !formData.password.trim() ||
      !formData.lecturerCode.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/admin/lecturer", formData);
      toast.success("Tạo giảng viên thành công");
      router.push("/admin/lecturers");
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (error.response?.status === 409) {
        toast.error("Email hoặc mã giảng viên đã tồn tại");
      } else {
        toast.error(message || "Không thể tạo giảng viên");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/lecturers">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Thêm giảng viên mới
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo tài khoản giảng viên trong hệ thống
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin giảng viên</CardTitle>
          <CardDescription>Nhập thông tin giảng viên mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AccountInfoSection formData={formData} onChange={setFormData} />
            <PersonalInfoSection formData={formData} onChange={setFormData} />
            <ProfessionalInfoSection
              formData={formData}
              onChange={setFormData}
            />

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Tạo giảng viên
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/lecturers">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
