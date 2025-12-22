"use client";

import TermSelect from "../shared/term-select";
import LecturerSelect from "../shared/lecturer-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentFilterProps {
  termId: string;
  teacherId: string;
  status: string;
  onTermChange: (value: string) => void;
  onTeacherChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function AssignmentFilter({
  termId,
  teacherId,
  status,
  onTermChange,
  onTeacherChange,
  onStatusChange,
}: AssignmentFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="w-[240px]">
        <TermSelect
          value={termId || null}
          onChange={(val) => onTermChange(val || "")}
          placeholder="Lọc theo học kỳ"
        />
      </div>
      <div className="w-[280px]">
        <LecturerSelect
          value={teacherId || null}
          onChange={(val) => onTeacherChange(val || "")}
          placeholder="Lọc theo giảng viên"
        />
      </div>
      <Select value={status || "ALL"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="PENDING">Chờ duyệt</SelectItem>
          <SelectItem value="APPROVED">Đã duyệt</SelectItem>
          <SelectItem value="REJECTED">Từ chối</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
