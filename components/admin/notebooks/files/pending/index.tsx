"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  PagedResponse,
  NotebookFileResponse,
} from "@/types/admin/notebook-file";
import PendingFilter from "./pending-filter";
import PendingTable from "./pending-table";
import PendingPagination from "./pending-pagination";
import ApproveAllButton from "./approve-all-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PendingFiles() {
  const [data, setData] = useState<PagedResponse<NotebookFileResponse> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState("");
  const [notebookId, setNotebookId] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    loadPendingFiles();
  }, [page, search, notebookId, mimeType, uploadedBy, sortBy]);

  const loadPendingFiles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        ...(search && { search }),
        ...(notebookId && notebookId !== "ALL" && { notebookId }),
        ...(mimeType && mimeType !== "ALL" && { mimeType }),
        ...(uploadedBy && uploadedBy !== "ALL" && { uploadedBy }),
      });

      const response = await api.get<PagedResponse<NotebookFileResponse>>(
        `/admin/files/pending?${params}`
      );

      setData(response.data);
    } catch (error) {
      console.error("Error fetching pending files:", error);
      toast.error("Không thể tải danh sách files pending");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleNotebookIdChange = (value: string) => {
    setNotebookId(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleMimeTypeChange = (value: string) => {
    setMimeType(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleUploadedByChange = (value: string) => {
    setUploadedBy(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Files Chờ Duyệt</h1>
        <p className="text-muted-foreground mt-1.5">
          Quản lý các files đang chờ duyệt trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm và lọc files pending theo notebook, loại file và các tiêu
            chí khác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingFilter
            search={search}
            notebookId={notebookId}
            mimeType={mimeType}
            uploadedBy={uploadedBy}
            sortBy={sortBy}
            onSearchChange={handleSearchChange}
            onNotebookIdChange={handleNotebookIdChange}
            onMimeTypeChange={handleMimeTypeChange}
            onUploadedByChange={handleUploadedByChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách files pending</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.totalElements} file`
                  : "Tất cả files đang chờ duyệt"}
              </CardDescription>
            </div>
            {data && data.totalElements > 0 && (
              <ApproveAllButton
                notebookId={notebookId || undefined}
                pendingCount={data.totalElements}
                onSuccess={loadPendingFiles}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-64 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.content.length > 0 ? (
            <div className="space-y-4">
              <PendingTable
                files={data.content}
                onApproveSuccess={loadPendingFiles}
              />
              {data.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <PendingPagination
                    page={data.page}
                    size={data.size}
                    totalElements={data.totalElements}
                    totalPages={data.totalPages}
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
                Không tìm thấy file
              </p>
              <p className="text-sm text-muted-foreground">
                {search || notebookId || mimeType || uploadedBy
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có file nào đang chờ duyệt"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
