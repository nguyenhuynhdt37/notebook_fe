"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerClassPagedResponse } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClassFilter from "./class-filter";
import ClassPagination from "./class-pagination";
import ClassCard from "./class-card";

interface ClassListProps {
  assignmentId: string;
  showAddButton?: boolean;
}

export default function ClassList({
  assignmentId,
  showAddButton = true,
}: ClassListProps) {
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
        `/lecturer/teaching-assignments/${assignmentId}/classes?${params}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải danh sách lớp học phần");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <ClassFilter
        assignmentId={assignmentId}
        search={search}
        onSearchChange={handleSearchChange}
        showAddButton={showAddButton}
      />

      {/* Stats Summary */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {data.meta.total} lớp học phần
          </span>
          <span>•</span>
          <span>
            {data.items.reduce((sum, c) => sum + c.studentCount, 0)} sinh viên
          </span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <ClassListSkeleton />
      ) : data && data.items && data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((item) => (
            <ClassCard key={item.id} data={item} />
          ))}
        </div>
      ) : (
        <ClassListEmpty
          assignmentId={assignmentId}
          hasSearch={!!search}
          showAddButton={showAddButton}
        />
      )}

      {/* Pagination */}
      {data && (
        <ClassPagination
          page={page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// Skeleton component
function ClassListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function ClassListEmpty({
  assignmentId,
  hasSearch,
  showAddButton,
}: {
  assignmentId: string;
  hasSearch: boolean;
  showAddButton: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
          <Layers className="size-10 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-foreground text-background">
          <Plus className="size-4" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        Chưa có lớp học phần
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasSearch
          ? "Không tìm thấy lớp nào phù hợp với từ khóa"
          : "Bạn chưa có lớp học phần nào. Hãy thêm lớp để bắt đầu quản lý sinh viên."}
      </p>
      {!hasSearch && showAddButton && (
        <Button asChild size="lg">
          <Link href={`/lecturer/assignments/${assignmentId}/classes/add`}>
            <Plus className="mr-2 size-4" />
            Thêm lớp học phần đầu tiên
          </Link>
        </Button>
      )}
    </div>
  );
}
