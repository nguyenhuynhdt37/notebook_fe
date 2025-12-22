"use client";

import { Button } from "@/components/ui/button";

interface ClassPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function ClassPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: ClassPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Trang {page + 1} / {totalPages} • {total} lớp học phần
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
