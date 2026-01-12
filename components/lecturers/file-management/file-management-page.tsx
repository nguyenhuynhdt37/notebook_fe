"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Upload, Plus, FolderOpen, FileCheck, Loader2, Files } from "lucide-react";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { Notebook, NotebookFile, PagedResponse } from "@/types/lecturer/exam";
import FileTable from "@/components/lecturers/file-management/file-table";
import FilePagination from "@/components/lecturers/file-management/file-pagination";
import FileUpload from "@/components/lecturers/file-management/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function FileManagementPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string>("ALL");
  const [data, setData] = useState<PagedResponse<NotebookFile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [selectedNotebook, page, search, sortBy]);

  const loadNotebooks = async () => {
    try {
      const notebooks = await examApi.getAccessibleNotebooks();
      setNotebooks(notebooks);
    } catch (error) {
      console.error("Error loading notebooks:", error);
      toast.error("Không thể tải danh sách notebook");
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      let files: NotebookFile[] = [];

      if (selectedNotebook === "ALL") {
        files = await examApi.getAllAccessibleFiles(search, undefined, 1000);
      } else {
        files = await examApi.getNotebookFiles(selectedNotebook, search);
      }

      // Sort
      files.sort((a, b) => {
        switch (sortBy) {
          case "createdAt":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "createdAtAsc":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "originalFilename":
            return a.originalFilename.localeCompare(b.originalFilename);
          default:
            return 0;
        }
      });

      // Pagination
      const totalElements = files.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const paginatedFiles = files.slice(startIndex, startIndex + size);

      setData({
        content: paginatedFiles,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page === totalPages - 1,
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Không thể tải danh sách files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadFiles();
    setUploadDialogOpen(false);
  };

  const stats = {
    total: data?.totalElements || 0,
    ready: data?.content.filter((f) => f.ocrDone && f.embeddingDone).length || 0,
    processing: data?.content.filter((f) => !f.ocrDone || !f.embeddingDone).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header với Stats inline */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Files</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài liệu để tạo câu hỏi AI
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats compact */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Files className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{stats.total}</span>
              <span className="text-muted-foreground">files</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{stats.ready}</span>
              <span className="text-muted-foreground">sẵn sàng</span>
            </div>
            {stats.processing > 0 && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                <span className="font-medium text-orange-500">{stats.processing}</span>
                <span className="text-muted-foreground">đang xử lý</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/lecturer/exams")}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo câu hỏi AI
            </Button>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={selectedNotebook === "ALL"}>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <FileUpload
                  notebookId={selectedNotebook}
                  onUploadSuccess={handleUploadSuccess}
                  onClose={() => setUploadDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters Row - Compact */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Notebook Select */}
        <Select value={selectedNotebook} onValueChange={(v) => { setSelectedNotebook(v); setPage(0); }}>
          <SelectTrigger className="w-[280px] h-9">
            <SelectValue placeholder="Chọn notebook" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả notebooks</SelectItem>
            {notebooks.map((nb) => (
              <SelectItem key={nb.id} value={nb.id}>
                <span className="truncate">{nb.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm file..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Mới nhất</SelectItem>
            <SelectItem value="createdAtAsc">Cũ nhất</SelectItem>
            <SelectItem value="originalFilename">Tên A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Files Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.content.length > 0 ? (
            <>
              <FileTable
                files={data.content}
                onFileDeleted={loadFiles}
                showNotebook={selectedNotebook === "ALL"}
              />
              {data.totalPages > 1 && (
                <div className="p-4 border-t">
                  <FilePagination
                    page={data.page}
                    size={data.size}
                    totalElements={data.totalElements}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Files className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">Chưa có file nào</p>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedNotebook === "ALL"
                  ? "Chọn notebook và upload files để bắt đầu"
                  : "Upload files vào notebook này"}
              </p>
              {selectedNotebook !== "ALL" && (
                <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload files
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
