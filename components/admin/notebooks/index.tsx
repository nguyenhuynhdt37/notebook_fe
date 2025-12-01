"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { PagedResponse, NotebookAdminResponse } from "@/types/admin/notebook";
import NotebookFilter from "./notebook-filter";
import NotebookCardList from "./notebook-card-list";
import NotebookPagination from "./notebook-pagination";
import NotebookDeleteDialog from "./notebook-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Notebooks() {
  const router = useRouter();
  const [data, setData] = useState<PagedResponse<NotebookAdminResponse> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [visibility, setVisibility] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] =
    useState<NotebookAdminResponse | null>(null);

  useEffect(() => {
    loadNotebooks();
  }, [page, q, type, visibility, sortBy, sortDir]);

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(type && { type }),
        ...(visibility && { visibility }),
      });

      const response = await api.get<PagedResponse<NotebookAdminResponse>>(
        `/admin/community?${params}`
      );

      setData(response.data);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
      toast.error("Không thể tải danh sách notebooks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setType(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleVisibilityChange = (value: string) => {
    setVisibility(value === "ALL" ? "" : value);
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

  const handleDeleteClick = (notebook: NotebookAdminResponse) => {
    setNotebookToDelete(notebook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    loadNotebooks();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notebooks</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý notebooks trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/notebooks/pending")}
          >
            <Clock className="mr-2 size-4" />
            Yêu cầu tham gia
          </Button>
          <Button asChild>
            <Link href="/admin/notebooks/new">
              <Plus className="mr-2 size-4" />
              Tạo notebook
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm và lọc notebook theo loại và hiển thị
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotebookFilter
            q={q}
            type={type}
            visibility={visibility}
            sortBy={sortBy}
            sortDir={sortDir}
            onQChange={handleQChange}
            onTypeChange={handleTypeChange}
            onVisibilityChange={handleVisibilityChange}
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
            <p className="text-muted-foreground">
              {q || type || visibility
                ? "Không tìm thấy notebook nào phù hợp"
                : "Chưa có notebook nào trong hệ thống"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <NotebookCardList
            notebooks={data.items}
            onDelete={handleDeleteClick}
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

      {notebookToDelete && (
        <NotebookDeleteDialog
          notebookId={notebookToDelete.id}
          notebookTitle={notebookToDelete.title}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
