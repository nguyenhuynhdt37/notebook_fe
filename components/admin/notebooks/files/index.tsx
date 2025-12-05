"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, Upload, RotateCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  PagedResponse,
  NotebookFileResponse,
} from "@/types/admin/notebook-file";
import FileFilter from "./file-filter";
import FileTable from "./file-table";
import FilePagination from "./file-pagination";
import FileUpload from "./create";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RetryAllResponse {
  retriedCount: number;
  message: string;
}

export default function Files() {
  const params = useParams();
  const notebookId = params.id as string;
  const [data, setData] = useState<PagedResponse<NotebookFileResponse> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [ocrDone, setOcrDone] = useState("");
  const [embeddingDone, setEmbeddingDone] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [retryAllDialogOpen, setRetryAllDialogOpen] = useState(false);
  const [retryAllLoading, setRetryAllLoading] = useState(false);

  useEffect(() => {
    if (notebookId) {
      loadFiles();
    }
  }, [
    notebookId,
    page,
    search,
    status,
    mimeType,
    ocrDone,
    embeddingDone,
    uploadedBy,
    sortBy,
  ]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        ...(search && { search }),
        ...(status && status !== "ALL" && { status }),
        ...(mimeType && mimeType !== "ALL" && { mimeType }),
        ...(ocrDone && ocrDone !== "ALL" && { ocrDone: ocrDone }),
        ...(embeddingDone &&
          embeddingDone !== "ALL" && { embeddingDone: embeddingDone }),
        ...(uploadedBy && uploadedBy !== "ALL" && { uploadedBy }),
      });

      const response = await api.get<PagedResponse<NotebookFileResponse>>(
        `/admin/notebooks/${notebookId}/files?${params}`
      );

      setData(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleMimeTypeChange = (value: string) => {
    setMimeType(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleOcrDoneChange = (value: string) => {
    setOcrDone(value === "ALL" ? "" : value);
    setPage(0);
  };

  const handleEmbeddingDoneChange = (value: string) => {
    setEmbeddingDone(value === "ALL" ? "" : value);
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

  const handleUploadSuccess = () => {
    loadFiles();
    setUploadDialogOpen(false);
  };

  const handleRetrySuccess = () => {
    loadFiles();
  };

  const failedFilesCount =
    data?.content.filter((file) => file.status === "failed").length || 0;

  const handleRetryAll = async () => {
    try {
      setRetryAllLoading(true);
      const response = await api.put<RetryAllResponse>(
        `/admin/notebooks/${notebookId}/files/retry-all`
      );
      const result = response.data;
      toast.success(
        `Đã thử lại ${result.retriedCount} file(s) bị lỗi!\n${result.message}`
      );
      setRetryAllDialogOpen(false);
      loadFiles();
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as any).response?.data?.message || "Lỗi khi thử lại files"
          : "Lỗi không xác định";
      toast.error(errorMessage);
    } finally {
      setRetryAllLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách Files</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý files trong notebook
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="size-4" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <FileUpload
              notebookId={notebookId}
              onUploadSuccess={handleUploadSuccess}
              onClose={() => setUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm và lọc files theo trạng thái, loại file và các tiêu chí
            khác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileFilter
            notebookId={notebookId}
            search={search}
            status={status}
            mimeType={mimeType}
            ocrDone={ocrDone}
            embeddingDone={embeddingDone}
            uploadedBy={uploadedBy}
            sortBy={sortBy}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onMimeTypeChange={handleMimeTypeChange}
            onOcrDoneChange={handleOcrDoneChange}
            onEmbeddingDoneChange={handleEmbeddingDoneChange}
            onUploadedByChange={handleUploadedByChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách files</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.totalElements} file`
                  : "Tất cả files trong notebook"}
                {failedFilesCount > 0 && (
                  <span className="ml-2 text-destructive">
                    ({failedFilesCount} file(s) bị lỗi)
                  </span>
                )}
              </CardDescription>
            </div>
            {failedFilesCount > 0 && (
              <AlertDialog
                open={retryAllDialogOpen}
                onOpenChange={setRetryAllDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCw className="size-4" />
                    Thử lại tất cả ({failedFilesCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Thử lại tất cả files bị lỗi
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn thử lại xử lý cho {failedFilesCount}{" "}
                      file(s) bị lỗi?
                      <br />
                      <br />
                      <span className="font-medium text-foreground">
                        Lưu ý: Tất cả chunks cũ của các files này sẽ bị xóa và
                        tạo lại từ đầu.
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={retryAllLoading}>
                      Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRetryAll}
                      disabled={retryAllLoading}
                    >
                      {retryAllLoading ? "Đang xử lý..." : "Thử lại tất cả"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <FileTable
                files={data.content}
                onRetrySuccess={handleRetrySuccess}
              />
              {data.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <FilePagination
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
                {search ||
                status ||
                mimeType ||
                ocrDone ||
                embeddingDone ||
                uploadedBy
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có file nào trong notebook"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
