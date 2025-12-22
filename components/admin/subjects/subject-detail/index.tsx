"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { SubjectDetailResponse } from "@/types/admin/subject";
import { Button } from "@/components/ui/button";
import StatsCards from "./stats-cards";
import MajorList from "./major-list";
import AssignmentList from "./assignment-list";

interface SubjectDetailProps {
  subjectId: string;
}

export default function SubjectDetail({ subjectId }: SubjectDetailProps) {
  const [subject, setSubject] = useState<SubjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const response = await api.get<SubjectDetailResponse>(
          `/admin/subject/${subjectId}`
        );
        setSubject(response.data);
      } catch {
        toast.error("Không thể tải thông tin môn học");
      } finally {
        setIsLoading(false);
      }
    };
    loadSubject();
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-lg bg-muted animate-pulse" />
          <div className="h-80 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <BookOpen className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Không tìm thấy môn học
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/subjects">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/admin/subjects">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {subject.name}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm font-medium">
                {subject.code}
              </span>
              <span className="text-sm">•</span>
              <span className="text-sm">Trang chi tiết môn học</span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/subjects/${subjectId}/edit`}>
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Link>
        </Button>
      </div>

      <StatsCards subject={subject} />

      <div className="grid gap-6 lg:grid-cols-2">
        <MajorList majors={subject.majors} />
        <AssignmentList assignments={subject.assignments} />
      </div>
    </div>
  );
}
