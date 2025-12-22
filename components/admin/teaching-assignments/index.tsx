"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AssignmentResponse } from "@/types/admin/teaching-assignment";
import AssignmentFilter from "./assignment-filter";
import AssignmentTable from "./assignment-table";
import AssignmentPagination from "./assignment-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PagedResponse {
  items: AssignmentResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export default function TeachingAssignments() {
  const [data, setData] = useState<PagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [termId, setTermId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadAssignments();
  }, [page, termId, teacherId, status]);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(termId && { termId }),
        ...(teacherId && { teacherId }),
        ...(status && status !== "ALL" && { status }),
      });

      // API có thể trả về Array hoặc PagedResponse
      // Chúng ta dùng 'any' tạm thời để handle linh hoạt
      const response = await api.get<any>(
        `/admin/teaching-assignments?${params}`
      );

      const rawData = response.data;

      if (Array.isArray(rawData)) {
        // Handle case API trả về Array raw
        setData({
          items: rawData, // Dùng trực tiếp array
          meta: {
            page: page,
            size: size,
            total: rawData.length,
            totalPages: 1, // Giả sử 1 trang vì backend chưa paging
          },
        });
      } else {
        // Handle case PagedResponse chuẩn
        setData(rawData);
      }
    } catch {
      toast.error("Không thể tải danh sách phân công");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermChange = (value: string) => {
    setTermId(value);
    setPage(0);
  };

  const handleTeacherChange = (value: string) => {
    setTeacherId(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Phân công giảng dạy
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý phân công giảng viên cho các môn học
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/teaching-assignments/new">
            <Plus className="mr-2 size-4" />
            Thêm phân công
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách phân công</CardTitle>
              <CardDescription className="mt-1">
                {data?.meta?.total !== undefined
                  ? `Tổng cộng ${data.meta.total} phân công`
                  : "Tất cả phân công trong hệ thống"}
              </CardDescription>
            </div>
            <AssignmentFilter
              termId={termId}
              teacherId={teacherId}
              status={status}
              onTermChange={handleTermChange}
              onTeacherChange={handleTeacherChange}
              onStatusChange={handleStatusChange}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-64 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.items && data.items.length > 0 ? (
            <div className="space-y-4">
              <AssignmentTable
                assignments={data.items}
                onRefresh={loadAssignments}
              />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <ClipboardList className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy phân công
              </p>
              <p className="text-sm text-muted-foreground">
                {termId || teacherId || status
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có phân công nào trong hệ thống"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
