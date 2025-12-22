"use client";

import { useState } from "react";
import {
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SourceResponse } from "@/types/user/chatbot";
import { NotebookFileResponse } from "@/types/admin/notebook-file";

interface SourcesDetailProps {
  sources?: NotebookFileResponse[];
  sourceDetails?: SourceResponse[];
  trigger?: React.ReactNode;
}

export default function SourcesDetail({
  sources = [],
  sourceDetails = [],
  trigger,
}: SourcesDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const hasSources = sources.length > 0 || sourceDetails.length > 0;
  if (!hasSources) return null;

  const ragSources = sourceDetails.filter((s) => s.sourceType === "RAG");
  const webSources = sourceDetails.filter((s) => s.sourceType === "WEB");

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="text-xs font-medium gap-1.5 px-3 py-1.5 h-auto border-border/50 bg-background/80 hover:bg-background transition-colors "
      onClick={() => setIsOpen(true)}
    >
      <FileText className="size-3" />
      <span>
        {sources.length + sourceDetails.length}{" "}
        {sources.length + sourceDetails.length === 1 ? "nguồn" : "nguồn"}
      </span>
      <ChevronDown className="size-3" />
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Chi tiết nguồn tham khảo
            </DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về các nguồn được sử dụng trong câu trả lời
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* RAG Sources */}
            {ragSources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Tài liệu ({ragSources.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {ragSources.map((source, index) => {
                    const fileSource = sources.find((s) => s.id === source.fileId);
                    return (
                      <div
                        key={`rag-${index}`}
                        className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="size-4 text-primary shrink-0" />
                              <h4 className="font-semibold text-sm text-foreground truncate">
                                {fileSource?.originalFilename ||
                                  source.fileId ||
                                  "Tài liệu không xác định"}
                              </h4>
                            </div>

                            {fileSource && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                                {fileSource.mimeType && (
                                  <div>
                                    <span className="font-medium">Loại:</span>{" "}
                                    {fileSource.mimeType}
                                  </div>
                                )}
                                {fileSource.fileSize > 0 && (
                                  <div>
                                    <span className="font-medium">Kích thước:</span>{" "}
                                    {formatFileSize(fileSource.fileSize)}
                                  </div>
                                )}
                                {fileSource.pagesCount !== null && (
                                  <div>
                                    <span className="font-medium">Số trang:</span>{" "}
                                    {fileSource.pagesCount}
                                  </div>
                                )}
                                {fileSource.chunksCount > 0 && (
                                  <div>
                                    <span className="font-medium">Số chunks:</span>{" "}
                                    {fileSource.chunksCount}
                                  </div>
                                )}
                              </div>
                            )}

                            {source.chunkIndex !== null && source.chunkIndex !== undefined && (
                              <Badge
                                variant="outline"
                                className="text-xs mb-2 border-primary/30 bg-primary/5"
                              >
                                Chunk #{source.chunkIndex}
                              </Badge>
                            )}

                            {source.content && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Nội dung trích dẫn:
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={() => handleCopy(source.content || "", index)}
                                  >
                                    {copiedIndex === index ? (
                                      <Check className="size-3 text-primary" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </Button>
                                </div>
                                <div className="rounded-lg bg-background/60 border border-border/50 p-3 text-xs leading-relaxed text-foreground/90 max-h-32 overflow-y-auto">
                                  {source.content}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                              {source.similarity !== null &&
                                source.similarity !== undefined && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs gap-1 border-primary/30 bg-primary/5"
                                  >
                                    <Sparkles className="size-3" />
                                    Độ tương đồng: {formatScore(source.similarity)}
                                  </Badge>
                                )}
                              {source.score !== null && source.score !== undefined && (
                                <Badge
                                  variant="outline"
                                  className="text-xs gap-1"
                                >
                                  Điểm: {formatScore(source.score)}
                                </Badge>
                              )}
                              {source.provider && (
                                <Badge variant="outline" className="text-xs">
                                  {source.provider}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Web Sources */}
            {webSources.length > 0 && (
              <div className="space-y-3">
                {ragSources.length > 0 && <Separator />}
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Nguồn Web ({webSources.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {webSources.map((source, index) => (
                    <div
                      key={`web-${index}`}
                      className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            {source.favicon && (
                              <img
                                src={source.favicon}
                                alt=""
                                className="size-5 rounded shrink-0 mt-0.5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              {source.title && (
                                <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                                  {source.title}
                                </h4>
                              )}
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1.5 truncate"
                                >
                                  <ExternalLink className="size-3 shrink-0" />
                                  <span className="truncate">{source.url}</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {source.snippet && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Mô tả:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  onClick={() =>
                                    handleCopy(source.snippet || "", 1000 + index)
                                  }
                                >
                                  {copiedIndex === 1000 + index ? (
                                    <Check className="size-3 text-primary" />
                                  ) : (
                                    <Copy className="size-3" />
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-lg bg-background/60 border border-border/50 p-3 text-xs leading-relaxed text-foreground/90">
                                {source.snippet}
                              </div>
                            </div>
                          )}

                          {source.imageUrl && (
                            <div className="mt-3">
                              <img
                                src={source.imageUrl}
                                alt={source.title || "Preview"}
                                className="rounded-lg max-w-full h-auto max-h-48 object-cover border border-border/50"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                            {source.webIndex !== null &&
                              source.webIndex !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  Vị trí: #{source.webIndex + 1}
                                </Badge>
                              )}
                            {source.score !== null && source.score !== undefined && (
                              <Badge
                                variant="outline"
                                className="text-xs gap-1"
                              >
                                <Sparkles className="size-3" />
                                Điểm: {formatScore(source.score)}
                              </Badge>
                            )}
                            {source.provider && (
                              <Badge variant="outline" className="text-xs">
                                {source.provider}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: Show basic sources if no sourceDetails */}
            {sourceDetails.length === 0 && sources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Tài liệu ({sources.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div
                      key={source.id}
                      className="rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {source.originalFilename}
                          </h4>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {source.mimeType}
                            {source.fileSize > 0 && ` • ${formatFileSize(source.fileSize)}`}
                            {source.pagesCount !== null && ` • ${source.pagesCount} trang`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

