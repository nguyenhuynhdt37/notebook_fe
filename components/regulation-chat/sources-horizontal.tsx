"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  Quote,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSource,
  RegulationFile,
  NotebookInfo,
} from "@/types/user/regulation-chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/api/client/axios";

interface SourcesHorizontalProps {
  sources: MessageSource[];
}

export default function SourcesHorizontal({
  sources = [],
}: SourcesHorizontalProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  if (!sources || sources.length === 0) return null;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(0)}%`;
  };

  const handleOpenFile = async (fileId: string) => {
    if (!fileId || loadingFileId === fileId) return;

    setLoadingFileId(fileId);
    try {
      // First, get notebookId
      const notebookResponse = await api.get<{ data: NotebookInfo }>(
        "/user/regulation/notebook"
      );
      const notebookId = notebookResponse.data.data.id;

      // Then get file info - API returns RegulationFile directly
      const fileResponse = await api.get<RegulationFile>(
        `/user/notebooks/${notebookId}/files/user/files/${fileId}`
      );

      const file = fileResponse.data;
      if (file.storageUrl) {
        window.open(file.storageUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error loading file:", error);
      // Fallback: try simpler endpoint
      try {
        const fileResponse = await api.get<{ data: RegulationFile }>(
          `/user/regulation/files/${fileId}`
        );
        const file = fileResponse.data.data;
        if (file.storageUrl) {
          window.open(file.storageUrl, "_blank", "noopener,noreferrer");
        }
      } catch (fallbackError) {
        console.error("Error loading file with fallback:", fallbackError);
      }
    } finally {
      setLoadingFileId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-2 pb-2 min-w-max">
        {sources.map((source, index) => {
          const sourceId = `source-${source.fileId}-${index}`;
          return (
            <Popover key={sourceId}>
              <PopoverTrigger asChild>
                <div className="shrink-0 w-[160px] cursor-pointer group">
                  <div className="bg-muted/50 hover:bg-muted border border-border/50 rounded-lg p-2 transition-colors flex items-center gap-2 h-9">
                    <div className="shrink-0 text-primary">
                      <FileText className="size-3.5" />
                    </div>
                    <span className="text-xs font-medium truncate text-foreground/80 group-hover:text-foreground transition-colors flex-1 min-w-0">
                      {source.fileName || "Tài liệu"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px] bg-background/50 text-muted-foreground font-normal shrink-0"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <div className="p-3 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md shrink-0">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4
                        className="font-semibold text-sm leading-none wrap-break-word cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (source.fileId) {
                            handleOpenFile(source.fileId);
                          }
                        }}
                      >
                        {source.fileName}
                      </h4>
                      {loadingFileId === source.fileId && (
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Chunk Content */}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Quote className="size-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Trích dẫn (Đoạn #{source.chunkIndex})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-background"
                        onClick={() =>
                          handleCopy(source.content || "", sourceId)
                        }
                      >
                        {copiedIndex === sourceId ? (
                          <Check className="size-3 text-primary" />
                        ) : (
                          <Copy className="size-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm leading-relaxed text-foreground/90 max-h-[200px] overflow-y-auto pr-1">
                      {source.content}
                    </div>
                  </div>

                  {/* Similarity Score */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Độ tương đồng</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formatScore(source.similarity ?? source.score ?? 0)}{" "}
                      match
                    </Badge>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
