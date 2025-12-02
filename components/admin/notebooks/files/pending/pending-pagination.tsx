"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingPaginationProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PendingPagination({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
}: PendingPaginationProps) {
  if (totalPages <= 1) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <p className="text-sm text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{start}</span> -{" "}
        <span className="font-medium text-foreground">{end}</span> trong tổng số{" "}
        <span className="font-medium text-foreground">{totalElements}</span>{" "}
        file
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="h-8"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-foreground min-w-[80px] text-center">
          Trang {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="h-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
