"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerClassPagedResponse } from "@/types/lecturer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ClassCard from "./class-card";

interface ClassListProps {
  assignmentId: string;
}

export default function ClassList({ assignmentId }: ClassListProps) {
  const [data, setData] = useState<LecturerClassPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadClasses();
  }, [assignmentId, page, search]);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "12",
        ...(search && { q: search }),
      });

      const res = await api.get<LecturerClassPagedResponse>(
        `/lecturer/assignments/${assignmentId}/classes?${params}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải danh sách lớp học phần");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm lớp học phần..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-5 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : data && data.items && data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((item) => (
            <ClassCard key={item.id} data={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            Không có lớp học phần
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search
              ? "Thử thay đổi từ khóa tìm kiếm"
              : "Chưa có lớp học phần nào được tạo cho môn này"}
          </p>
        </div>
      )}

      {/* Pagination - Simple */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-3 py-1.5 text-sm">
            Trang {page + 1} / {data.meta.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(data.meta.totalPages - 1, p + 1))
            }
            disabled={page >= data.meta.totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
