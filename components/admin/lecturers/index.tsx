"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerPagedResponse } from "@/types/admin/lecturer";
import LecturerFilter from "./lecturer-filter";
import LecturerTable from "./lecturer-table";
import LecturerPagination from "./lecturer-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Lecturers() {
  const [data, setData] = useState<LecturerPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [orgUnitId, setOrgUnitId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadLecturers();
  }, [page, q, orgUnitId, sortBy, sortDir]);

  const loadLecturers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(orgUnitId && { orgUnitId }),
      });

      const response = await api.get<LecturerPagedResponse>(
        `/admin/lecturer?${params}`
      );
      setData(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách giảng viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleOrgUnitChange = (value: string) => {
    setOrgUnitId(value);
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giảng viên</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý thông tin giảng viên trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lecturers/new">
            <Plus className="mr-2 size-4" />
            Thêm giảng viên
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách giảng viên</CardTitle>
              <CardDescription className="mt-1">
                {data?.meta?.total !== undefined
                  ? `Tổng cộng ${data.meta.total} giảng viên`
                  : "Tất cả giảng viên trong hệ thống"}
              </CardDescription>
            </div>
            <LecturerFilter
              q={q}
              orgUnitId={orgUnitId}
              onQChange={handleQChange}
              onOrgUnitChange={handleOrgUnitChange}
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
              <LecturerTable
                lecturers={data.items}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onDelete={loadLecturers}
              />
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <LecturerPagination
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
                <GraduationCap className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy giảng viên
              </p>
              <p className="text-sm text-muted-foreground">
                {q || orgUnitId
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có giảng viên nào trong hệ thống"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
