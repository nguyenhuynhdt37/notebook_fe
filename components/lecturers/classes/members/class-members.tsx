"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { LecturerStudentPagedResponse } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MemberFilter from "./member-filter";
import MemberPagination from "./member-pagination";
import MemberRow from "./member-row";

interface ClassMembersProps {
  classId: string;
  showAddButton?: boolean;
}

export default function ClassMembers({
  classId,
  showAddButton = true,
}: ClassMembersProps) {
  const [data, setData] = useState<LecturerStudentPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadMembers();
  }, [classId, page, search]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "20",
        ...(search && { q: search }),
      });

      const res = await api.get<LecturerStudentPagedResponse>(
        `/lecturer/classes/${classId}/members?${params}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải danh sách thành viên");
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
      <MemberFilter
        classId={classId}
        search={search}
        onSearchChange={handleSearchChange}
        showAddButton={showAddButton}
      />

      {/* Stats */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{data.meta.total}</span>{" "}
          sinh viên
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <MemberListSkeleton />
      ) : data && data.items && data.items.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted/50 px-4 py-3 border-b grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground">
            <div className="col-span-5">Sinh viên</div>
            <div className="col-span-3 hidden sm:block">Mã sinh viên</div>
            <div className="col-span-2 hidden md:block">Ngày sinh</div>
            <div className="col-span-2 hidden lg:block">Lớp HP</div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {data.items.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      ) : (
        <MemberListEmpty
          classId={classId}
          hasSearch={!!search}
          showAddButton={showAddButton}
        />
      )}

      {/* Pagination */}
      {data && (
        <MemberPagination
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
function MemberListSkeleton() {
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
function MemberListEmpty({
  classId,
  hasSearch,
  showAddButton,
}: {
  classId: string;
  hasSearch: boolean;
  showAddButton: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
          <Users className="size-10 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-foreground text-background">
          <Plus className="size-4" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        Chưa có sinh viên
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasSearch
          ? "Không tìm thấy sinh viên nào phù hợp với từ khóa"
          : "Lớp này chưa có sinh viên nào. Hãy thêm sinh viên để bắt đầu."}
      </p>
      {!hasSearch && showAddButton && (
        <Button asChild size="lg">
          <Link href={`/lecturer/classes/${classId}/members/add`}>
            <UserPlus className="mr-2 size-4" />
            Thêm sinh viên đầu tiên
          </Link>
        </Button>
      )}
    </div>
  );
}
