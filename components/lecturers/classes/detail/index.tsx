"use client";

import { useState, useEffect } from "react";
import api from "@/api/client/axios";
import { LecturerClassResponse } from "@/types/lecturer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  CreditCard,
  FileCheck,
  Video,
  ClipboardList,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ClassDetailViewProps {
  id: string;
}

export default function ClassDetailView({ id }: ClassDetailViewProps) {
  const router = useRouter();
  const [classInfo, setClassInfo] = useState<LecturerClassResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClassDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<LecturerClassResponse>(`/lecturer/classes/${id}`);
        setClassInfo(res.data);
      } catch {
        // Silent error handling
      } finally {
        setIsLoading(false);
      }
    };
    loadClassDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6 mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="container py-6 mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Không tìm thấy thông tin lớp học
        </div>
      </div>
    );
  }

  const contentStats = [
    { icon: FileText, label: "Tài liệu", value: classInfo.fileCount },
    { icon: HelpCircle, label: "Quiz", value: classInfo.quizCount },
    { icon: CreditCard, label: "Flashcard", value: classInfo.flashcardCount },
    { icon: FileCheck, label: "Tóm tắt", value: classInfo.summaryCount },
    { icon: Video, label: "Video", value: classInfo.videoCount },
  ];

  return (
    <div className="container py-6 space-y-6 mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Quay lại
      </Button>

      {/* Main Info Card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{classInfo.classCode}</Badge>
              <Badge variant="outline">{classInfo.subjectCode}</Badge>
              {classInfo.isActive && <Badge>Đang hoạt động</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{classInfo.subjectName}</h1>
            <p className="text-muted-foreground mt-1">{classInfo.termName}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Thứ</p>
              <p className="font-medium">{classInfo.dayOfWeek}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiết</p>
              <p className="font-medium">{classInfo.periods}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <MapPin className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phòng</p>
              <p className="font-medium">{classInfo.room}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sinh viên</p>
              <p className="font-medium">{classInfo.studentCount}</p>
            </div>
          </div>
        </div>

        {/* Dates & Info */}
        <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Bắt đầu:</span>
              <span className="font-medium">{new Date(classInfo.startDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Kết thúc:</span>
              <span className="font-medium">{new Date(classInfo.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
            {classInfo.note && (
              <div className="flex items-start gap-2 text-sm mt-3">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span>{classInfo.note}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="font-medium">{new Date(classInfo.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Cập nhật:</span>
              <span className="font-medium">{new Date(classInfo.updatedAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs">{classInfo.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="size-5" />
          Nội dung học tập
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {contentStats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Icon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notebook & Assignment */}
      <div className="grid md:grid-cols-2 gap-6">
        {classInfo.notebookId && (
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <BookOpen className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sổ tay điện tử</h3>
                <p className="text-sm text-muted-foreground">{classInfo.notebookTitle}</p>
              </div>
            </div>
          </div>
        )}

        {classInfo.assignmentId && (
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted shrink-0">
                <ClipboardList className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phân công giảng dạy</h3>
                <Badge variant={classInfo.assignmentStatus === "ACTIVE" ? "default" : "secondary"}>
                  {classInfo.assignmentStatus === "ACTIVE" ? "Đang hoạt động" : classInfo.assignmentStatus}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
