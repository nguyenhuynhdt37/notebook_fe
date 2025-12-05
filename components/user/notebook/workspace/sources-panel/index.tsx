"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import SourceSearch from "./source-search";
import SourceList from "./source-list";
import FileDetail from "./file-detail";

interface SourcesPanelProps {
  notebookId: string;
  onSelectionChange?: (selectedFileIds: string[]) => void;
}

export default function SourcesPanel({
  notebookId,
  onSelectionChange,
}: SourcesPanelProps) {
  const [files, setFiles] = useState<NotebookFileResponse[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(
    async (searchTerm?: string) => {
      if (!notebookId) return;

      setLoading(true);
      setError(null);

      try {
        const params = searchTerm ? { search: searchTerm } : {};
        const response = await api.get<NotebookFileResponse[]>(
          `/user/notebooks/${notebookId}/files`,
          { params }
        );
        setFiles(response.data);
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
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFiles(search);
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border/60 bg-background px-3 py-2.5 shrink-0">
        <SourceSearch
          onSelectAll={handleSelectAll}
          selectedCount={selectedFiles.size}
          totalCount={files.filter((f) => f.status === "done").length}
        />
        <Input
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs mt-2 bg-muted/30 border-border/40 focus:border-border focus:ring-1 focus:ring-ring/20"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
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

