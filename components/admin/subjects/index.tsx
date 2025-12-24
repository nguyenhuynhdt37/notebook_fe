"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { SubjectPagedResponse } from "@/types/admin/subject";
import SubjectFilter from "./subject-filter";
import SubjectTable from "./subject-table";
import SubjectPagination from "./subject-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Subjects() {
  const [data, setData] = useState<SubjectPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(11);
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [majorId, setMajorId] = useState("");
  const [sortBy, setSortBy] = useState("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadSubjects();
  }, [page, q, isActive, majorId, sortBy, sortDir]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(isActive && { isActive }),
        ...(majorId && { majorId }),
      });

      const response = await api.get<SubjectPagedResponse>(
        `/admin/subject?${params}`
      );
      setData(response.data);
    } catch {
      toast.error("Không thể tải danh sách môn học");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleIsActiveChange = (value: string) => {
    setIsActive(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleMajorIdChange = (value: string) => {
    setMajorId(value === "ALL" ? "" : value);
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
          <h1 className="text-3xl font-bold tracking-tight">Môn học</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý các môn học trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/subjects/new">
            <Plus className="mr-2 size-4" />
            Thêm môn học
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách môn học</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.meta.total} môn học`
                  : "Tất cả môn học trong hệ thống"}
              </CardDescription>
            </div>
            <SubjectFilter
              q={q}
              isActive={isActive}
              majorId={majorId}
              onQChange={handleQChange}
              onIsActiveChange={handleIsActiveChange}
              onMajorIdChange={handleMajorIdChange}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-64 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.items && data.items.length > 0 ? (
            <div className="space-y-4">
              <SubjectTable
                subjects={data.items}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onDelete={loadSubjects}
              />
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <SubjectPagination
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
                <BookOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy môn học
              </p>
              <p className="text-sm text-muted-foreground">
                {q || isActive
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có môn học nào trong hệ thống"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
