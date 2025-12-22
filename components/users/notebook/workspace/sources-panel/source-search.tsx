"use client";

import { Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SourceSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onAdd?: () => void;
  onSelectAll?: () => void;
  selectedCount?: number;
  totalCount?: number;
}

export default function SourceSearch({
  value = "",
  onChange,
  onAdd,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
}: SourceSearchProps) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <h2 className="font-semibold text-base text-foreground">Nguồn</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:bg-muted/60"
              >
                <HelpCircle className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                Thêm tài liệu, video, podcast để AI phân tích và tóm tắt
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {totalCount > 0 && (
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 h-5 font-medium"
          >
            {selectedCount}/{totalCount}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {totalCount > 0 && onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-7 text-xs px-2.5 hover:bg-muted/60"
          >
            {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipContent>
              <p className="text-sm">Thêm nguồn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
