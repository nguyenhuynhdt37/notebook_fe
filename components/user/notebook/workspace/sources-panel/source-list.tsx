"use client";

import { FileText, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import SourceItem from "./source-item";

interface SourceListProps {
  sources: NotebookFileResponse[];
  notebookId: string;
  selectedFiles?: Set<string>;
  loading?: boolean;
  error?: string | null;
  onRemove?: (id: string) => void;
  onAdd?: () => void;
  onRetry?: () => void;
  onToggleFile?: (id: string) => void;
  onViewDetail?: (fileId: string) => void;
}

export default function SourceList({
  sources,
  notebookId,
  selectedFiles = new Set(),
  loading,
  error,
  onRemove,
  onAdd,
  onRetry,
  onToggleFile,
  onViewDetail,
}: SourceListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="mb-5 inline-flex p-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 shadow-lg border border-border/40">
          <AlertCircle className="size-14 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">
          {error}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/60 hover:bg-muted/60 hover:shadow-md transition-all"
            onClick={onRetry}
          >
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="mb-5 inline-flex p-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 shadow-lg border border-border/40">
          <FileText className="size-14 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Chưa có nguồn nào
        </h3>
        <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">
          Thêm tài liệu, video hoặc podcast để bắt đầu sử dụng tính năng AI
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/60 hover:bg-muted/60 hover:shadow-md transition-all"
          onClick={onAdd}
        >
          <Plus className="size-4" />
          Thêm nguồn đầu tiên
        </Button>
        <div className="mt-8 pt-6 border-t border-border/40 w-full max-w-xs">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">
            Định dạng hỗ trợ
          </p>
          <ul className="text-xs text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              PDF, DOCX, TXT
            </li>
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              Video (MP4, YouTube)
            </li>
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-foreground/40" />
              Audio (MP3, Podcast)
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sources.map((source) => (
        <SourceItem
          key={source.id}
          source={source}
          notebookId={notebookId}
          selected={selectedFiles.has(source.id)}
          onRemove={onRemove}
          onToggleSelect={onToggleFile}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}
