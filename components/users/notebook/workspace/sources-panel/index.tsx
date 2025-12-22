"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import { PanelLeftClose, PanelLeft, FileText, FolderOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SourceSearch from "./source-search";
import SourceList from "./source-list";
import FileDetail from "./file-detail";
import FileUpload from "./file-upload";

interface SourcesPanelProps {
  notebookId: string;
  onSelectionChange?: (selectedFileIds: string[]) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function SourcesPanel({
  notebookId,
  onSelectionChange,
  collapsed = false,
  onCollapsedChange,
}: SourcesPanelProps) {
  const [files, setFiles] = useState<NotebookFileResponse[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (searchTerm?: string, autoSelect = false) => {
      if (!notebookId) return;

      setLoading(true);
      setError(null);

      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await api.get<NotebookFileResponse[]>(
          `/user/notebooks/${notebookId}/files`,
          { params }
        );
        const fetchedFiles = response.data;
        setFiles(fetchedFiles);

        // Tự động chọn tất cả file có status === "done" khi load lần đầu hoặc khi autoSelect = true
        if (autoSelect || !searchTerm) {
          const availableFiles = fetchedFiles.filter(
            (f) => f.status === "done"
          );
          if (availableFiles.length > 0) {
            setSelectedFiles(new Set(availableFiles.map((f) => f.id)));
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Vui lòng đăng nhập");
        } else {
          setError("Không thể tải danh sách file");
        }
      } finally {
        setLoading(false);
      }
    },
    [notebookId]
  );

  const handleRemove = useCallback(
    async (fileId: string) => {
      try {
        await api.delete(`/user/notebooks/${notebookId}/files/${fileId}`);
        toast.success("Đã xóa file thành công");
        setSelectedFiles((prev) => {
          const next = new Set(prev);
          next.delete(fileId);
          return next;
        });
        fetchFiles(search);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Không thể xóa file";
        toast.error(errorMessage);
      }
    },
    [notebookId, search, fetchFiles]
  );

  const handleToggleFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const availableFiles = files.filter((f) => f.status === "done");
    if (selectedFiles.size === availableFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(availableFiles.map((f) => f.id)));
    }
  }, [files, selectedFiles]);

  const handleViewDetail = useCallback((fileId: string) => {
    setViewingFileId(fileId);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewingFileId(null);
  }, []);

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedFiles));
  }, [selectedFiles, onSelectionChange]);

  useEffect(() => {
    fetchFiles(undefined, true); // Tự động chọn khi load lần đầu
  }, [fetchFiles]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFiles(search, false); // Không tự động chọn khi search
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, fetchFiles]);

  if (viewingFileId) {
    return (
      <FileDetail
        notebookId={notebookId}
        fileId={viewingFileId}
        onBack={handleBackToList}
      />
    );
  }

  // Collapsed state - thin sidebar with icons
  if (collapsed) {
    const doneFiles = files.filter((f) => f.status === "done");
    return (
      <div className="h-full w-12 flex flex-col bg-background border-r border-border/50">
        {/* Toggle button */}
        <div className="p-2 border-b border-border/50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCollapsedChange?.(false)}
                  className="size-8"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Mở rộng panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* File icons */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1">
          {doneFiles.slice(0, 8).map((file) => (
            <TooltipProvider key={file.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedFiles.has(file.id) ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handleToggleFile(file.id)}
                    className="size-8"
                  >
                    <FileText className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-48 truncate">{file.originalFilename}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {doneFiles.length > 8 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="size-8 flex items-center justify-center text-xs text-muted-foreground">
                    +{doneFiles.length - 8}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{doneFiles.length - 8} file khác</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Selected count */}
        {selectedFiles.size > 0 && (
          <div className="p-2 border-t border-border/50">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="size-8 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-md">
                    {selectedFiles.size}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{selectedFiles.size} file đã chọn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    );
  }

  // Expanded state - full panel
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border/50 bg-background px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCollapsedChange?.(true)}
                    className="size-8"
                  >
                    <PanelLeftClose className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Thu gọn panel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <SourceSearch
              onSelectAll={handleSelectAll}
              selectedCount={selectedFiles.size}
              totalCount={files.filter((f) => f.status === "done").length}
            />
          </div>
          <FileUpload
            notebookId={notebookId}
            onSuccess={() => fetchFiles(search, false)}
          />
        </div>
        <Input
          placeholder="Tìm kiếm nguồn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm mt-2 bg-muted/40 border-border/50 focus:border-border focus:ring-1 focus:ring-ring/20"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <SourceList
          sources={files}
          notebookId={notebookId}
          selectedFiles={selectedFiles}
          loading={loading}
          error={error}
          onRetry={() => fetchFiles(search)}
          onRemove={handleRemove}
          onToggleFile={handleToggleFile}
          onViewDetail={handleViewDetail}
        />
      </div>
    </div>
  );
}
