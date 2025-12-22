"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  LecturerResponse,
  UpdateLecturerRequest,
} from "@/types/admin/lecturer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AccountInfoSection from "./account-info-section";
import PersonalInfoSection from "./personal-info-section";
import ProfessionalInfoSection from "./professional-info-section";

interface LecturerEditProps {
  lecturerId: string;
}

export default function LecturerEdit({ lecturerId }: LecturerEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<UpdateLecturerRequest>({
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
    active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: lecturer } = await api.get<LecturerResponse>(
          `/admin/lecturer/${lecturerId}`
        );

        setFormData({
          email: lecturer.email,
          fullName: lecturer.fullName,
          password: "",
          lecturerCode: lecturer.lecturerCode || "",
          orgUnitId: lecturer.orgUnit?.id || undefined,
          academicDegree: lecturer.academicDegree || undefined,
          academicRank: lecturer.academicRank || undefined,
          specialization: lecturer.specialization || "",
          phone: lecturer.phone || "",
          avatarUrl: lecturer.avatarUrl || "",
          active: lecturer.active ?? true,
        });
      } catch (error) {
        toast.error("Không thể tải thông tin giảng viên");
        router.push("/admin/lecturers");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [lecturerId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email?.trim() || !formData.fullName?.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      await api.put(`/admin/lecturer/${lecturerId}`, payload);
      toast.success("Cập nhật giảng viên thành công");
      router.push("/admin/lecturers");
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (error.response?.status === 409) {
        toast.error("Email hoặc mã giảng viên đã tồn tại");
      } else {
        toast.error(message || "Không thể cập nhật giảng viên");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Chỉnh sửa giảng viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin giảng viên
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin giảng viên</CardTitle>
          <CardDescription>Chỉnh sửa thông tin giảng viên</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AccountInfoSection
              formData={formData}
              onChange={setFormData}
              isEditMode
            />
            <PersonalInfoSection formData={formData} onChange={setFormData} />
            <ProfessionalInfoSection
              formData={formData}
              onChange={setFormData}
            />

            {/* Trạng thái - Chỉ có ở Edit */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="active">Trạng thái hoạt động</Label>
                <p className="text-sm text-muted-foreground">
                  Giảng viên có đang hoạt động không?
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Cập nhật
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
