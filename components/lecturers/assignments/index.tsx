"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ClipboardList, GraduationCap, BookMarked, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  LecturerAssignmentResponse,
  LecturerAssignmentPagedResponse,
} from "@/types/lecturer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AssignmentCard from "./assignment-card";
import AssignmentFilter from "./assignment-filter";
import AssignmentPagination from "./assignment-pagination";
import AssignmentStats from "./assignment-stats";

export default function LecturerAssignments() {
  const [data, setData] = useState<LecturerAssignmentPagedResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [termId, setTermId] = useState("");
  const [termStatus, setTermStatus] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");

  // Tính toán stats từ data
  const stats = useMemo(() => {
    if (!data?.items)
      return { total: 0, approved: 0, pending: 0, totalStudents: 0 };

    const items = data.items;
    return {
      total: data.meta.total,
      approved: items.filter((i) => i.approvalStatus === "APPROVED").length,
      pending: items.filter((i) => i.approvalStatus === "PENDING").length,
      totalStudents: items.reduce((sum, i) => sum + i.studentCount, 0),
    };
  }, [data]);

  useEffect(() => {
    loadAssignments();
  }, [page, termId, termStatus, approvalStatus]);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "12",
        ...(termId && { termId }),
        ...(termStatus && termStatus !== "ALL" && { termStatus }),
        ...(approvalStatus &&
          approvalStatus !== "ALL" && { status: approvalStatus }),
      });

      const response = await api.get<LecturerAssignmentPagedResponse>(
        `/lecturer/assignments?${params}`
      );
      setData(response.data);
    } catch {
      toast.error("Không thể tải danh sách phân công");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermIdChange = (value: string) => {
    setTermId(value);
    setPage(0);
  };

  const handleTermStatusChange = (value: string) => {
    setTermStatus(value);
    setPage(0);
  };

  const handleApprovalStatusChange = (value: string) => {
    setApprovalStatus(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Môn học phân công
            </h1>
            <p className="text-muted-foreground">
              Quản lý các môn học bạn được phân công giảng dạy
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/lecturer/assignments/request">
            <Plus className="mr-2 size-4" />
            Yêu cầu dạy
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <AssignmentStats
        total={stats.total}
        approved={stats.approved}
        pending={stats.pending}
        totalStudents={stats.totalStudents}
        isLoading={isLoading}
      />

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <BookMarked className="size-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Danh sách phân công</CardTitle>
                  {data?.meta?.total !== undefined && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {data.meta.total}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Lọc và quản lý các môn học của bạn
                </CardDescription>
              </div>
            </div>
            <AssignmentFilter
              termId={termId}
              termStatus={termStatus}
              approvalStatus={approvalStatus}
              onTermIdChange={handleTermIdChange}
              onTermStatusChange={handleTermStatusChange}
              onApprovalStatusChange={handleApprovalStatusChange}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl border p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="size-11 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-6 pt-2 border-t">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.items && data.items.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.items.map((item) => (
                  <AssignmentCard
                    key={item.id}
                    id={item.id}
                    subjectCode={item.subjectCode}
                    subjectName={item.subjectName}
                    termName={item.termName}
                    approvalStatus={item.approvalStatus}
                    classCount={item.classCount}
                    studentCount={item.studentCount}
                    termStatus={item.termStatus}
                  />
                ))}
              </div>
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <AssignmentPagination
                    meta={data.meta}
                    page={page}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardList className="size-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">
                Không tìm thấy phân công
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {termId || termStatus || approvalStatus
                  ? "Thử thay đổi bộ lọc để tìm kiếm kết quả khác"
                  : "Bạn chưa được phân công giảng dạy môn học nào"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
