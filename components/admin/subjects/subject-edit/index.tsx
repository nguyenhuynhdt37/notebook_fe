"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  SubjectDetailResponse,
  UpdateSubjectRequest,
  MajorAssignment,
} from "@/types/admin/subject";
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

interface SubjectEditProps {
  subjectId: string;
}

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

export default function SubjectEdit({ subjectId }: SubjectEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialSelectedMajors, setInitialSelectedMajors] = useState<
    Record<number, MajorOption>
  >({});
  const [formData, setFormData] = useState<UpdateSubjectRequest>({
    code: "",
    name: "",
    credit: undefined,
    isActive: true,
    majorAssignments: [],
  });

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const loadData = async () => {
    try {
      const { data: subject } = await api.get<SubjectDetailResponse>(
        `/admin/subject/${subjectId}`
      );

      const assignments: MajorAssignment[] = (subject.majors || []).map(
        (m) => ({
          majorId: m.id,
          termNo: m.termNo ?? 1,
          isRequired: m.isRequired,
          knowledgeBlock: m.knowledgeBlock ?? "",
        })
      );

      const selected: Record<number, MajorOption> = {};
      (subject.majors || []).forEach((m, index) => {
        selected[index] = { id: m.id, code: m.code, name: m.name };
      });
      setInitialSelectedMajors(selected);

      setFormData({
        code: subject.code,
        name: subject.name,
        credit: subject.credit ?? undefined,
        isActive: subject.isActive,
        majorAssignments: assignments,
      });
    } catch {
      toast.error("Không thể tải thông tin môn học");
      router.push("/admin/subjects");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code?.trim() || !formData.name?.trim()) {
      toast.error("Vui lòng nhập mã và tên môn học");
      return;
    }

    const validAssignments = (formData.majorAssignments || []).filter(
      (a) => a.majorId
    );

    setIsLoading(true);
    try {
      await api.put(`/admin/subject/${subjectId}`, {
        ...formData,
        majorAssignments: validAssignments,
      });
      toast.success("Cập nhật môn học thành công");
      router.push("/admin/subjects");
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err.response?.status;
      if (status === 404) {
        toast.error("Không tìm thấy môn học");
      } else if (status === 409) {
        toast.error("Mã môn học mới đã tồn tại");
      } else {
        toast.error(
          err.response?.data?.message || "Không thể cập nhật môn học"
        );
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
        <div className="max-w-4xl h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

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
            Chỉnh sửa môn học
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin môn học
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin môn học</CardTitle>
            <CardDescription>
              Chỉnh sửa thông tin cơ bản của môn học
            </CardDescription>
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
          initialSelectedMajors={initialSelectedMajors}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Cập nhật
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/subjects">Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
