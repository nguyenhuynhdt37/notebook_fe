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

interface UserFilterProps {
  q: string;
  role: string;
  onQChange: (q: string) => void;
  onRoleChange: (role: string) => void;
}

export default function UserFilter({
  q,
  role,
  onQChange,
  onRoleChange,
}: UserFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tên, email..."
          className="w-64 pl-9 h-9"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
        />
      </div>
      <Select value={role || "ALL"} onValueChange={onRoleChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Tất cả vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả vai trò</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="USER">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

