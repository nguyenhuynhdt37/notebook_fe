"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { TermPagedResponse } from "@/types/admin/term";
import TermFilter from "./term-filter";
import TermTable from "./term-table";
import TermPagination from "./term-pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Terms() {
  const [data, setData] = useState<TermPagedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(13);
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadTerms();
  }, [page, q, isActive, sortBy, sortDir]);

  const loadTerms = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(isActive && { isActive }),
      });

      const response = await api.get<TermPagedResponse>(
        `/admin/term?${params}`
      );
      setData(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách học kỳ");
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
          <h1 className="text-3xl font-bold tracking-tight">Học kỳ</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý các học kỳ trong hệ thống
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/terms/new">
            <Plus className="mr-2 size-4" />
            Thêm học kỳ
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách học kỳ</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.meta.total} học kỳ`
                  : "Tất cả học kỳ trong hệ thống"}
              </CardDescription>
            </div>
            <TermFilter
              q={q}
              isActive={isActive}
              onQChange={handleQChange}
              onIsActiveChange={handleIsActiveChange}
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
              <TermTable
                terms={data.items}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onDelete={loadTerms}
              />
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <TermPagination
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
                <Calendar className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy học kỳ
              </p>
              <p className="text-sm text-muted-foreground">
                {q || isActive
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có học kỳ nào trong hệ thống"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
