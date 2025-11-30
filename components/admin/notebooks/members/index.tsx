"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { PagedResponse, MemberResponse } from "@/types/admin/member";
import MemberFilter from "./member-filter";
import MemberTable from "./member-table";
import MemberPagination from "./member-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotebookMembers() {
  const params = useParams();
  const router = useRouter();
  const notebookId = params.id as string;

  const [data, setData] = useState<PagedResponse<MemberResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("joinedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (notebookId) {
      loadMembers();
    }
  }, [notebookId, page, q, status, sortBy, sortDir]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(status && status !== "ALL" && { status }),
      });

      const response = await api.get<PagedResponse<MemberResponse>>(
        `/admin/community/${notebookId}/members?${params}`
      );

      setData(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    if (value.includes("_")) {
      const [field, dir] = value.split("_");
      setSortBy(field);
      setSortDir(dir as "asc" | "desc");
    } else {
      setSortBy(value);
      setSortDir("desc");
    }
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thành viên</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý danh sách thành viên của notebook
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách thành viên</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.meta.total} thành viên`
                  : "Tất cả thành viên của notebook này"}
              </CardDescription>
            </div>
            <MemberFilter
              q={q}
              status={status}
              sortBy={sortBy}
              sortDir={sortDir}
              onQChange={handleQChange}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
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
          ) : data && data.items.length > 0 ? (
            <div className="space-y-4">
              <MemberTable members={data.items} onRefresh={loadMembers} />
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <MemberPagination
                    meta={data.meta}
                    page={page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy thành viên
              </p>
              <p className="text-sm text-muted-foreground">
                {q || status
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có thành viên nào trong notebook này"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
