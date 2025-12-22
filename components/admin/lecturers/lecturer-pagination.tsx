"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LecturerPagedMeta } from "@/types/admin/lecturer";

interface LecturerPaginationProps {
  meta: LecturerPagedMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export default function LecturerPagination({
  meta,
  page,
  onPageChange,
}: LecturerPaginationProps) {
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
        <span className="font-medium text-foreground">{meta.total}</span> giảng
        viên
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
