"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { 
  Notebook, 
  NotebookFile, 
  PagedResponse 
} from "@/types/lecturer/exam";
import FileFilter from "@/components/lecturers/file-management/file-filter";
import FileTable from "@/components/lecturers/file-management/file-table";
import FilePagination from "@/components/lecturers/file-management/file-pagination";
import FileUpload from "@/components/lecturers/file-management/file-upload";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function FileManagementPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string>("ALL");
  const [data, setData] = useState<PagedResponse<NotebookFile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [ocrDone, setOcrDone] = useState("");
  const [embeddingDone, setEmbeddingDone] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [
    selectedNotebook,
    page,
    search,
    status,
    mimeType,
    ocrDone,
    embeddingDone,
    sortBy,
  ]);

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
        // Load all accessible files
        files = await examApi.getAllAccessibleFiles(search, undefined, 1000);
      } else {
        // Load files from specific notebook
        files = await examApi.getNotebookFiles(selectedNotebook, search);
      }

      // Apply filters
      let filteredFiles = files;
      
      if (status && status !== "ALL") {
        filteredFiles = filteredFiles.filter(file => file.status === status);
      }
      
      if (mimeType && mimeType !== "ALL") {
        filteredFiles = filteredFiles.filter(file => file.mimeType === mimeType);
      }
      
      if (ocrDone && ocrDone !== "ALL") {
        const ocrFilter = ocrDone === "true";
        filteredFiles = filteredFiles.filter(file => file.ocrDone === ocrFilter);
      }
      
      if (embeddingDone && embeddingDone !== "ALL") {
        const embeddingFilter = embeddingDone === "true";
        filteredFiles = filteredFiles.filter(file => file.embeddingDone === embeddingFilter);
      }

      // Apply sorting
      filteredFiles.sort((a, b) => {
        switch (sortBy) {
          case "createdAt":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "createdAtAsc":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "originalFilename":
            return a.originalFilename.localeCompare(b.originalFilename);
          case "originalFilenameDesc":
            return b.originalFilename.localeCompare(a.originalFilename);
          default:
            return 0;
        }
      });

      // Pagination
      const totalElements = filteredFiles.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleNotebookChange = (value: string) => {
    setSelectedNotebook(value);
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

  const handleFileDeleted = () => {
    loadFiles();
  };

  const getStats = () => {
    if (!data) return { total: 0, ready: 0, processing: 0 };
    
    const allFiles = data.content;
    const ready = allFiles.filter(f => f.status === "done" && f.ocrDone && f.embeddingDone).length;
    const processing = allFiles.filter(f => f.status !== "done" || !f.ocrDone || !f.embeddingDone).length;
    
    return {
      total: data.totalElements,
      ready,
      processing
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Files</h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý files trong notebooks để tạo câu hỏi AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/lecturer/exams')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo câu hỏi AI
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={selectedNotebook === "ALL"}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả files có quyền truy cập
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Files Sẵn Sàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">
              Đã hoàn thành OCR và embedding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đang Xử Lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              Đang OCR hoặc tạo embedding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notebook Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Chọn Notebook</CardTitle>
          <CardDescription className="mt-1">
            Chọn notebook để xem files hoặc xem tất cả files có quyền truy cập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedNotebook} onValueChange={handleNotebookChange}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Chọn notebook..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả notebooks</SelectItem>
                {notebooks.map((notebook) => (
                  <SelectItem key={notebook.id} value={notebook.id}>
                    <div className="flex flex-col">
                      <span>{notebook.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notebook.readyFiles}/{notebook.totalFiles} files sẵn sàng
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedNotebook === "ALL" && (
              <p className="text-sm text-muted-foreground">
                Chỉ có thể upload files khi chọn notebook cụ thể
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm và lọc files theo trạng thái, loại file và các tiêu chí khác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileFilter
            search={search}
            status={status}
            mimeType={mimeType}
            ocrDone={ocrDone}
            embeddingDone={embeddingDone}
            sortBy={sortBy}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onMimeTypeChange={handleMimeTypeChange}
            onOcrDoneChange={handleOcrDoneChange}
            onEmbeddingDoneChange={handleEmbeddingDoneChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách files</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.totalElements} file`
                  : "Tất cả files có quyền truy cập"}
              </CardDescription>
            </div>
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
                onFileDeleted={handleFileDeleted}
                showNotebook={selectedNotebook === "ALL"}
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
                embeddingDone
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : selectedNotebook === "ALL" 
                    ? "Chưa có file nào"
                    : "Chưa có file nào trong notebook này"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}