"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

interface AssignmentPaginationProps {
  meta: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export default function AssignmentPagination({
  meta,
  page,
  onPageChange,
}: AssignmentPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị{" "}
        <span className="font-medium text-foreground">
          {page * meta.size + 1}
        </span>{" "}
        -{" "}
        <span className="font-medium text-foreground">
          {Math.min((page + 1) * meta.size, meta.total)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-medium text-foreground">{meta.total}</span> phân
        công
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium px-2">
          Trang {page + 1} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
