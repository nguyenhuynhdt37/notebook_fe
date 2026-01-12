"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Input } from "@/components/ui/input";
import MemberTable from "./member-table";
import MemberEmpty from "./member-empty";
import MemberPagination from "./member-pagination";
import MemberSkeleton from "./member-skeleton";

interface ClassStudent {
  id: string;
  studentCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  classCode: string;
  createdAt: string;
}

interface ClassMembersResponse {
  items: ClassStudent[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

interface ClassMembersProps {
  classId: string;
}

export default function ClassMembers({ classId }: ClassMembersProps) {
  const [data, setData] = useState<ClassMembersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  useEffect(() => {
    loadMembers();
  }, [classId, page, search]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        ...(search && { q: search }),
      });

      const res = await api.get<ClassMembersResponse>(
        `/lecturer/classes/${classId}/members?${params}`
      );
      setData(res.data);
    } catch {
      toast.error("Không thể tải danh sách sinh viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  if (isLoading) {
    return <MemberSkeleton />;
  }

  const totalElements = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;
  const students = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã SV, họ tên..."
            value={search}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalElements}</span> sinh viên
        </div>
      </div>

      {/* Content */}
      {students.length > 0 ? (
        <MemberTable students={students} page={page} pageSize={pageSize} />
      ) : (
        <MemberEmpty hasSearch={!!search} />
      )}

      {/* Pagination */}
      <MemberPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
