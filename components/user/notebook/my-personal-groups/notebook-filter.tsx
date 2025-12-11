"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotebookFilterProps {
  q: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onQChange: (q: string) => void;
  onSortChange: (value: string) => void;
}

export default function NotebookFilter({
  q,
  sortBy,
  sortDir,
  onQChange,
  onSortChange,
}: NotebookFilterProps) {
  const getSortValue = () => {
    return `${sortBy}_${sortDir}`;
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tiêu đề, mô tả..."
          className="pl-9 h-9"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
      </div>
      <Select value={getSortValue()} onValueChange={onSortChange}>
        <SelectTrigger className="w-56 h-9">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt_desc">Ngày tạo (Mới nhất)</SelectItem>
          <SelectItem value="createdAt_asc">Ngày tạo (Cũ nhất)</SelectItem>
          <SelectItem value="updatedAt_desc">Cập nhật (Mới nhất)</SelectItem>
          <SelectItem value="updatedAt_asc">Cập nhật (Cũ nhất)</SelectItem>
          <SelectItem value="title_asc">Tiêu đề (A-Z)</SelectItem>
          <SelectItem value="title_desc">Tiêu đề (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
