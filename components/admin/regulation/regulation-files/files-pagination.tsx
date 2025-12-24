"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PagedMeta } from "@/types/admin/regulation";
import { Button } from "@/components/ui/button";

interface FilesPaginationProps {
  meta: PagedMeta;
  onPageChange: (page: number) => void;
}

export default function FilesPagination({
  meta,
  onPageChange,
}: FilesPaginationProps) {
  const { page, totalPages, total } = meta;

  if (totalPages <= 1) return null;

  const startItem = page * meta.size + 1;
  const endItem = Math.min((page + 1) * meta.size, total);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị {startItem}-{endItem} trong tổng {total} file
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="size-4" />
          Trước
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (page < 3) {
              pageNum = i;
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-9"
              >
                {pageNum + 1}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages - 1}
        >
          Sau
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
