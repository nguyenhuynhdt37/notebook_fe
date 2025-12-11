"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { PersonalNotebooksResponse } from "@/types/user/notebook";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NotebookFilter from "./notebook-filter";
import NotebookCardList from "./notebook-card-list";
import NotebookPagination from "./notebook-pagination";

export default function MyPersonalGroups() {
  const [data, setData] = useState<PersonalNotebooksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadNotebooks();
  }, [page, q, sortBy, sortDir]);

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
      });

      const response = await api.get<PersonalNotebooksResponse>(
        `/user/personal-notebooks?${params}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      toast.error("Không thể tải danh sách notebook cá nhân");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notebook cá nhân</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các notebook riêng tư của bạn
          </p>
        </div>
        <Button asChild>
          <Link href="/notebook/create">
            <Plus className="size-4 mr-2" />
            Tạo mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm notebook theo tiêu đề hoặc mô tả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotebookFilter
            q={q}
            sortBy={sortBy}
            sortDir={sortDir}
            onQChange={handleQChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="relative w-full aspect-square bg-muted">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-full" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-muted-foreground/20">
                    <div className="h-3 bg-muted-foreground/20 rounded w-16" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              {q
                ? "Không tìm thấy notebook nào phù hợp"
                : "Bạn chưa có notebook cá nhân nào"}
            </p>
            {!q && (
              <Button asChild>
                <Link href="/notebook/create">
                  <Plus className="size-4 mr-2" />
                  Tạo Notebook đầu tiên
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <NotebookCardList
            notebooks={data.items}
            onNotebookDeleted={loadNotebooks}
          />
          {data.meta.totalPages > 1 && (
            <NotebookPagination
              meta={data.meta}
              page={page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
