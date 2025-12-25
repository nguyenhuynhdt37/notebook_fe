"use client";

import { useState } from "react";
import { FileText, Copy, Check, ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSource } from "@/types/user/regulation-chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SourcesHorizontalProps {
  sources: MessageSource[];
}

export default function SourcesHorizontal({
  sources = [],
}: SourcesHorizontalProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

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

  return (
    <ScrollArea className="w-full pb-2">
      <div className="flex gap-2">
        {sources.map((source, index) => {
          const sourceId = `source-${source.fileId}-${index}`;
          return (
            <Popover key={sourceId}>
              <PopoverTrigger asChild>
                <div className="flex-shrink-0 max-w-[180px] cursor-pointer group">
                  <div className="bg-muted/50 hover:bg-muted border border-border/50 rounded-lg p-2 transition-colors flex items-center gap-2 h-9">
                    <div className="flex-shrink-0 text-primary">
                      <FileText className="size-3.5" />
                    </div>
                    <span className="text-xs font-medium truncate text-foreground/80 group-hover:text-foreground transition-colors">
                      {source.fileName || "Tài liệu"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px] bg-background/50 text-muted-foreground font-normal ml-auto shrink-0"
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
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-sm leading-none break-words">
                        {source.fileName}
                      </h4>
                      {source.fileUrl && (
                        <a
                          href={source.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <span className="truncate">Mở tài liệu gốc</span>
                          <ExternalLink className="size-3" />
                        </a>
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
                          handleCopy(source.chunkContent || "", sourceId)
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
                      {source.chunkContent}
                    </div>
                  </div>

                  {/* Similarity Score */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Độ tương đồng</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formatScore(source.similarity)} match
                    </Badge>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  );
}
