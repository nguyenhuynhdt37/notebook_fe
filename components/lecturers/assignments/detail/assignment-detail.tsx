"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerAssignmentResponse } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DetailHeader from "./detail-header";
import DetailStats from "./detail-stats";
import NotebookCard from "./notebook-card";
import RecentClasses from "./recent-classes";

interface AssignmentDetailProps {
  assignmentId: string;
}

export default function AssignmentDetail({
  assignmentId,
}: AssignmentDetailProps) {
  const router = useRouter();
  const [data, setData] = useState<LecturerAssignmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<LecturerAssignmentResponse>(
        `/lecturer/teaching-assignments/${assignmentId}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải thông tin môn học");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Không tìm thấy môn học</h2>
        <p className="text-muted-foreground mb-6">
          Môn học này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailHeader data={data} />

      {/* Stats */}
      <DetailStats data={data} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/lecturer/assignments/${assignmentId}/classes`}>
            <Layers className="size-4" />
            Quản lý lớp ({data.classCount})
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/lecturer/assignments/${assignmentId}/students`}>
            <Users className="size-4" />
            Sinh viên ({data.studentCount})
          </Link>
        </Button>
        {data.notebookId && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/notebooks/${data.notebookId}`}>
              <FileText className="size-4" />
              Tài liệu ({data.fileCount})
            </Link>
          </Button>
        )}
      </div>

      {/* Notebook */}
      <section>
        <h2 className="text-lg font-bold mb-4">Notebook</h2>
        <NotebookCard data={data} />
      </section>

      {/* Recent Classes */}
      <RecentClasses data={data} />
    </div>
  );
}

// Skeleton component
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="rounded-2xl border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10" />
          <div className="space-y-2 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Actions skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Notebook skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}
