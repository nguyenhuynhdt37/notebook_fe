"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import LecturerClassSelect from "../../shared/lecturer-class-select";

interface StudentFilterProps {
  assignmentId: string;
  search: string;
  classId: string | null;
  onSearchChange: (value: string) => void;
  onClassChange: (value: string | null) => void;
}

export default function StudentFilter({
  assignmentId,
  search,
  classId,
  onSearchChange,
  onClassChange,
}: StudentFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm mã SV, họ tên..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-64">
        <LecturerClassSelect
          assignmentId={assignmentId}
          value={classId}
          onChange={onClassChange}
          placeholder="Lọc theo lớp"
        />
      </div>
    </div>
  );
}
