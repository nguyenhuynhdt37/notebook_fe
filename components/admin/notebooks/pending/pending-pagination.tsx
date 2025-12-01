"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PagedMeta } from "@/types/admin/pending-request";

interface PendingPaginationProps {
  meta: PagedMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export default function PendingPagination({
  meta,
  page,
  onPageChange,
}: PendingPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <p className="text-sm text-muted-foreground">
        Hiển thị{" "}
        <span className="font-medium text-foreground">
          {meta.page * meta.size + 1}
        </span>{" "}
        -{" "}
        <span className="font-medium text-foreground">
          {Math.min((meta.page + 1) * meta.size, meta.total)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-medium text-foreground">{meta.total}</span> yêu
        cầu
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
          Trang {page + 1} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="h-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
