"use client";

import { Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-sm text-foreground">Nguồn</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-4 w-4 hover:bg-muted/50"
              >
                <HelpCircle className="size-3 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Thêm tài liệu, video, podcast để AI phân tích và tóm tắt
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {totalCount > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {selectedCount}/{totalCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {totalCount > 0 && onSelectAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-6 text-[10px] px-1.5 hover:bg-muted/50"
          >
            {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onAdd}
                className="h-6 w-6 hover:bg-muted/50"
              >
                <Plus className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Thêm nguồn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
