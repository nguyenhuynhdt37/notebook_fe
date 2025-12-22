"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORG_UNIT_TYPE_LABELS } from "@/types/admin/org-unit";

interface OrgUnitFilterProps {
  q: string;
  type: string;
  isActive: string;
  onQChange: (q: string) => void;
  onTypeChange: (type: string) => void;
  onIsActiveChange: (isActive: string) => void;
}

export default function OrgUnitFilter({
  q,
  type,
  isActive,
  onQChange,
  onTypeChange,
  onIsActiveChange,
}: OrgUnitFilterProps) {
  const [inputValue, setInputValue] = useState(q);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onQChange(value);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm theo tên, mã..."
          className="w-56 pl-9 h-9"
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>
      <Select value={type || "ALL"} onValueChange={onTypeChange}>
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Loại đơn vị" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả loại</SelectItem>
          {Object.entries(ORG_UNIT_TYPE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={isActive || "ALL"} onValueChange={onIsActiveChange}>
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="true">Hoạt động</SelectItem>
          <SelectItem value="false">Không hoạt động</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
