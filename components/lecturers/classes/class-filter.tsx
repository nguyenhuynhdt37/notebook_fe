"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClassFilterProps {
  assignmentId: string;
  search: string;
  onSearchChange: (value: string) => void;
  showAddButton?: boolean;
}

export default function ClassFilter({
  assignmentId,
  search,
  onSearchChange,
  showAddButton = true,
}: ClassFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm lớp học phần..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {showAddButton && (
        <Button asChild>
          <Link href={`/lecturer/assignments/${assignmentId}/classes/add`}>
            <Plus className="mr-2 size-4" />
            Thêm lớp
          </Link>
        </Button>
      )}
    </div>
  );
}
