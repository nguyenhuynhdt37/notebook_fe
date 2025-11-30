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
  type: string;
  visibility: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onQChange: (q: string) => void;
  onTypeChange: (type: string) => void;
  onVisibilityChange: (visibility: string) => void;
  onSortChange: (value: string) => void;
}

export default function NotebookFilter({
  q,
  type,
  visibility,
  sortBy,
  sortDir,
  onQChange,
  onTypeChange,
  onVisibilityChange,
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
      <Select value={type || "ALL"} onValueChange={onTypeChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Tất cả loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả loại</SelectItem>
          <SelectItem value="community">Cộng đồng</SelectItem>
          <SelectItem value="private_group">Nhóm riêng</SelectItem>
          <SelectItem value="personal">Cá nhân</SelectItem>
        </SelectContent>
      </Select>
      <Select value={visibility || "ALL"} onValueChange={onVisibilityChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Tất cả hiển thị" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả hiển thị</SelectItem>
          <SelectItem value="public">Công khai</SelectItem>
          <SelectItem value="private">Riêng tư</SelectItem>
        </SelectContent>
      </Select>
      <Select value={getSortValue()} onValueChange={onSortChange}>
        <SelectTrigger className="w-48 h-9">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt_desc">Ngày tạo (Giảm dần)</SelectItem>
          <SelectItem value="createdAt_asc">Ngày tạo (Tăng dần)</SelectItem>
          <SelectItem value="title_asc">Tiêu đề (A-Z)</SelectItem>
          <SelectItem value="title_desc">Tiêu đề (Z-A)</SelectItem>
          <SelectItem value="type_asc">Loại (Tăng dần)</SelectItem>
          <SelectItem value="type_desc">Loại (Giảm dần)</SelectItem>
          <SelectItem value="visibility_asc">Hiển thị (Tăng dần)</SelectItem>
          <SelectItem value="visibility_desc">Hiển thị (Giảm dần)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
