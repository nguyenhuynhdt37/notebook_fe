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

interface MemberFilterProps {
  q: string;
  status: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onQChange: (q: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (value: string) => void;
}

export default function MemberFilter({
  q,
  status,
  sortBy,
  sortDir,
  onQChange,
  onStatusChange,
  onSortChange,
}: MemberFilterProps) {
  const getSortValue = () => {
    return `${sortBy}_${sortDir}`;
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="pl-9 h-9"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
      </div>
      <Select value={status || "ALL"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          <SelectItem value="pending">Đang chờ duyệt</SelectItem>
          <SelectItem value="approved">Đã duyệt</SelectItem>
          <SelectItem value="rejected">Bị từ chối</SelectItem>
          <SelectItem value="blocked">Bị chặn</SelectItem>
        </SelectContent>
      </Select>
      <Select value={getSortValue()} onValueChange={onSortChange}>
        <SelectTrigger className="w-56 h-9">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="joinedAt_desc">Ngày tham gia (Mới nhất)</SelectItem>
          <SelectItem value="joinedAt_asc">Ngày tham gia (Cũ nhất)</SelectItem>
          <SelectItem value="createdAt_desc">Ngày tạo (Mới nhất)</SelectItem>
          <SelectItem value="createdAt_asc">Ngày tạo (Cũ nhất)</SelectItem>
          <SelectItem value="userFullName_asc">Tên (A-Z)</SelectItem>
          <SelectItem value="userFullName_desc">Tên (Z-A)</SelectItem>
          <SelectItem value="role_asc">Vai trò (A-Z)</SelectItem>
          <SelectItem value="role_desc">Vai trò (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

