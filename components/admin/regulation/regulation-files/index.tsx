"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  RegulationFileResponse,
  PagedResponse,
  GetRegulationFilesRequest,
} from "@/types/admin/regulation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FilesFilter from "./files-filter";
import FilesTable from "./files-table";
import FilesPagination from "./files-pagination";
import FilesRenameDialog from "./files-rename-dialog";
import FilesRetryOcrDialog from "./files-retry-ocr-dialog";
import FilesDeleteDialog from "./files-delete-dialog";

export default function RegulationFilesList() {
  const router = useRouter();
  const [data, setData] =
    useState<PagedResponse<RegulationFileResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<GetRegulationFilesRequest>({
    page: 0,
    size: 11,
    sortBy: "createdAt",
    sortDirection: "desc",
    status: undefined,
    search: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] =
    useState<RegulationFileResponse | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] =
    useState<RegulationFileResponse | null>(null);
  const [retryOcrDialogOpen, setRetryOcrDialogOpen] = useState(false);
  const [fileToRetryOcr, setFileToRetryOcr] =
    useState<RegulationFileResponse | null>(null);

  useEffect(() => {
    loadFiles();
  }, [params]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined)
        queryParams.append("page", params.page.toString());
      if (params.size !== undefined)
        queryParams.append("size", params.size.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortDirection)
        queryParams.append("sortDirection", params.sortDirection);
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);

      const response = await api.get<any>(
        `/admin/regulation/files?${queryParams}`
      );
      const responseData = response.data.data || response.data;
      setData(responseData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setParams((prev) => ({ ...prev, search: value, page: 0 }));
  };

  const handleStatusChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as any),
      page: 0,
    }));
  };

  const handleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field as any,
      sortDirection:
        prev.sortBy === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (file: RegulationFileResponse) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    loadFiles();
  };

  const handleRenameClick = (file: RegulationFileResponse) => {
    setFileToRename(file);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    loadFiles();
  };

  const handleRetryOcrClick = (file: RegulationFileResponse) => {
    setFileToRetryOcr(file);
    setRetryOcrDialogOpen(true);
  };

  const handleRetryOcrConfirm = () => {
    loadFiles();
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        className="pl-0 hover:bg-transparent"
        onClick={() => router.push("/admin/regulation")}
      >
        <ChevronLeft className="size-4 mr-2" />
        Quay lại
      </Button>
      <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <FilesFilter
            search={params.search || ""}
            status={params.status || "all"}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />
        </div>
        <Button
          onClick={() => router.push("/admin/regulation/upload")}
          className="shrink-0"
        >
          <Upload className="size-4 mr-2" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 border-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {params.search || params.status
                  ? "Không tìm thấy file nào"
                  : "Chưa có file nào"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <div className="text-xs text-muted-foreground">
                {data.items.length} / {data.meta.total} file
              </div>
              <FilesTable
                files={data.items}
                sortBy={params.sortBy || "createdAt"}
                sortDirection={params.sortDirection || "desc"}
                onSort={handleSort}
                onDelete={handleDeleteClick}
                onRename={handleRenameClick}
                onRetryOcr={handleRetryOcrClick}
              />
              {data.meta.totalPages > 1 && (
                <div className="pt-2">
                  <FilesPagination
                    meta={data.meta}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {fileToDelete && (
        <FilesDeleteDialog
          fileId={fileToDelete.id}
          fileName={fileToDelete.originalFilename}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteConfirm}
        />
      )}

      {fileToRename && (
        <FilesRenameDialog
          fileId={fileToRename.id}
          currentFilename={fileToRename.originalFilename}
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          onRename={handleRenameConfirm}
        />
      )}

      {fileToRetryOcr && (
        <FilesRetryOcrDialog
          fileId={fileToRetryOcr.id}
          fileName={fileToRetryOcr.originalFilename}
          open={retryOcrDialogOpen}
          onOpenChange={setRetryOcrDialogOpen}
          onRetry={handleRetryOcrConfirm}
        />
      )}
    </div>
  );
}
