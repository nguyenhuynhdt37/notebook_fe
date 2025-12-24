"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilesFilterProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function FilesFilter({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: FilesFilterProps) {
  const [inputValue, setInputValue] = useState(search);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Tìm kiếm</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="search"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Tìm theo tên file..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="w-48 space-y-2">
        <Label htmlFor="status">Trạng thái</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="done">Hoàn thành</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
