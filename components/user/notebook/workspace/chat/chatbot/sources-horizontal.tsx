"use client";

import {
  FileText,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SourceResponse } from "@/types/user/chatbot";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import { useRef, useState, useEffect } from "react";

interface SourcesHorizontalProps {
  sources?: NotebookFileResponse[];
  sourceDetails?: SourceResponse[];
}

export default function SourcesHorizontal({
  sources = [],
  sourceDetails = [],
}: SourcesHorizontalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const hasSources = sources.length > 0 || sourceDetails.length > 0;
  if (!hasSources) return null;

  const ragSources = sourceDetails.filter((s) => s.sourceType === "RAG");
  const webSources = sourceDetails.filter((s) => s.sourceType === "WEB");

  const checkScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [sources, sourceDetails]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="relative group w-full max-w-full overflow-hidden">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 hover:bg-background shadow-md border border-border/50 rounded-full"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="size-4" />
        </Button>
      )}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 hover:bg-background shadow-md border border-border/50 rounded-full"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="size-4" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth px-1 py-1 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* RAG Sources */}
        {ragSources.map((source, index) => {
          const fileSource = sources.find((s) => s.id === source.fileId);
          const sourceId = `rag-${source.fileId}-${index}`;
          return (
            <div
              key={sourceId}
              className="group/source flex-shrink-0 w-[180px] min-w-[180px] hover:w-[320px] rounded-xl border border-border/50 bg-muted/30 p-3 hover:bg-muted/40 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                <FileText className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate mb-1.5">
                    {fileSource?.originalFilename ||
                      source.fileId ||
                      "Tài liệu không xác định"}
                  </h4>

                  {/* Details - Hidden by default, shown on hover */}
                  <div className="opacity-0 group-hover/source:opacity-100 max-h-0 group-hover/source:max-h-[500px] transition-all duration-300 overflow-hidden space-y-2">
                    {fileSource && (
                      <div className="flex flex-wrap gap-1.5 mb-2 text-xs text-muted-foreground">
                        {fileSource.mimeType && (
                          <span className="truncate">
                            {fileSource.mimeType}
                          </span>
                        )}
                        {fileSource.fileSize > 0 && (
                          <span>• {formatFileSize(fileSource.fileSize)}</span>
                        )}
                        {fileSource.pagesCount !== null && (
                          <span>• {fileSource.pagesCount} trang</span>
                        )}
                      </div>
                    )}

                    {source.chunkIndex !== null &&
                      source.chunkIndex !== undefined && (
                        <Badge
                          variant="outline"
                          className="text-xs mb-2 border-primary/30 bg-primary/5"
                        >
                          Chunk #{source.chunkIndex}
                        </Badge>
                      )}

                    {source.content && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Trích dẫn:
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5"
                            onClick={() =>
                              handleCopy(source.content || "", sourceId)
                            }
                          >
                            {copiedIndex === sourceId ? (
                              <Check className="size-3 text-primary" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-background/60 border border-border/50 p-2.5 text-xs leading-relaxed text-foreground/90 max-h-24 overflow-y-auto">
                          {source.content}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/30">
                      {source.similarity !== null &&
                        source.similarity !== undefined && (
                          <Badge
                            variant="outline"
                            className="text-xs gap-1 border-primary/30 bg-primary/5"
                          >
                            <Sparkles className="size-2.5" />
                            {formatScore(source.similarity)}
                          </Badge>
                        )}
                      {source.score !== null && source.score !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Điểm: {formatScore(source.score)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Web Sources */}
        {webSources.map((source, index) => {
          const sourceId = `web-${index}`;
          return (
            <div
              key={sourceId}
              className="group/source flex-shrink-0 w-[180px] min-w-[180px] hover:w-[320px] rounded-xl border border-border/50 bg-muted/30 p-3 hover:bg-muted/40 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                {source.favicon ? (
                  <img
                    src={source.favicon}
                    alt=""
                    className="size-4 rounded shrink-0 mt-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Globe className="size-4 text-primary shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  {source.title && (
                    <h4 className="font-semibold text-sm text-foreground truncate mb-1.5">
                      {source.title}
                    </h4>
                  )}

                  {/* Details - Hidden by default, shown on hover */}
                  <div className="opacity-0 group-hover/source:opacity-100 max-h-0 group-hover/source:max-h-[500px] transition-all duration-300 overflow-hidden space-y-2">
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mb-2 truncate"
                      >
                        <ExternalLink className="size-3 shrink-0" />
                        <span className="truncate">{source.url}</span>
                      </a>
                    )}

                    {source.snippet && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            Mô tả:
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5"
                            onClick={() =>
                              handleCopy(source.snippet || "", sourceId)
                            }
                          >
                            {copiedIndex === sourceId ? (
                              <Check className="size-3 text-primary" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-background/60 border border-border/50 p-2.5 text-xs leading-relaxed text-foreground/90 max-h-24 overflow-y-auto">
                          {source.snippet}
                        </div>
                      </div>
                    )}

                    {source.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={source.imageUrl}
                          alt={source.title || "Preview"}
                          className="rounded-lg w-full h-auto max-h-32 object-cover border border-border/50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/30">
                      {source.webIndex !== null &&
                        source.webIndex !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            #{source.webIndex + 1}
                          </Badge>
                        )}
                      {source.score !== null && source.score !== undefined && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Sparkles className="size-2.5" />
                          {formatScore(source.score)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Fallback: Basic sources if no sourceDetails */}
        {sourceDetails.length === 0 &&
          sources.map((source) => (
            <div
              key={source.id}
              className="group/source flex-shrink-0 w-[180px] min-w-[180px] hover:w-[240px] rounded-xl border border-border/50 bg-muted/30 p-3 hover:bg-muted/40 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                <FileText className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate mb-1.5">
                    {source.originalFilename}
                  </h4>
                  {/* Details - Hidden by default, shown on hover */}
                  <div className="opacity-0 group-hover/source:opacity-100 max-h-0 group-hover/source:max-h-[200px] transition-all duration-300 overflow-hidden">
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {source.mimeType && <div>{source.mimeType}</div>}
                      {source.fileSize > 0 && (
                        <div>{formatFileSize(source.fileSize)}</div>
                      )}
                      {source.pagesCount !== null && (
                        <div>{source.pagesCount} trang</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
