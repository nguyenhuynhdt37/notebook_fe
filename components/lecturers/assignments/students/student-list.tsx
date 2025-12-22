"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerStudentPagedResponse } from "@/types/lecturer";
import { Skeleton } from "@/components/ui/skeleton";
import StudentFilter from "./student-filter";
import StudentPagination from "./student-pagination";
import StudentRow from "./student-row";

interface StudentListProps {
  assignmentId: string;
}

export default function StudentList({ assignmentId }: StudentListProps) {
  const [data, setData] = useState<LecturerStudentPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadStudents();
  }, [assignmentId, page, search, classId]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
        ...(search && { q: search }),
        ...(classId && { classId }),
      });

      const res = await api.get<LecturerStudentPagedResponse>(
        `/lecturer/teaching-assignments/${assignmentId}/students?${params}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleClassChange = (value: string | null) => {
    setClassId(value);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <StudentFilter
        assignmentId={assignmentId}
        search={search}
        classId={classId}
        onSearchChange={handleSearchChange}
        onClassChange={handleClassChange}
      />

      {/* Content */}
      {isLoading ? (
        <StudentListSkeleton />
      ) : data && data.items && data.items.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 border-b">
            <span className="text-sm font-medium">
              {data.meta.total} sinh viên
            </span>
          </div>
          <div className="divide-y">
            {data.items.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </div>
        </div>
      ) : (
        <StudentListEmpty hasFilters={!!search || !!classId} />
      )}

      {/* Pagination */}
      {data && (
        <StudentPagination
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
function StudentListSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <Skeleton className="h-5 w-32" />
      </div>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
        >
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Empty state component
function StudentListEmpty({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="size-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground mb-1">
        Không có sinh viên
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasFilters
          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
          : "Chưa có sinh viên nào trong môn học này"}
      </p>
    </div>
  );
}
