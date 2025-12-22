"use client";

import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import LecturerTermSelect from "../shared/lecturer-term-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentFilterProps {
  termId: string;
  termStatus: string;
  approvalStatus: string;
  onTermIdChange: (value: string) => void;
  onTermStatusChange: (value: string) => void;
  onApprovalStatusChange: (value: string) => void;
}

export default function AssignmentFilter({
  termId,
  termStatus,
  approvalStatus,
  onTermIdChange,
  onTermStatusChange,
  onApprovalStatusChange,
}: AssignmentFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Lọc theo học kỳ cụ thể */}
      <div className="w-[220px]">
        <LecturerTermSelect
          value={termId || null}
          onValueChange={(val) => onTermIdChange(val || "")}
          placeholder="Tất cả học kỳ"
        />
      </div>

      {/* Lọc theo trạng thái thời gian học kỳ */}
      <Select value={termStatus || "ALL"} onValueChange={onTermStatusChange}>
        <SelectTrigger className="w-[155px] h-9">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Thời gian" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="ACTIVE">Đang diễn ra</SelectItem>
          <SelectItem value="UPCOMING">Sắp tới</SelectItem>
          <SelectItem value="PAST">Đã kết thúc</SelectItem>
        </SelectContent>
      </Select>

      {/* Lọc theo trạng thái phê duyệt */}
      <Select
        value={approvalStatus || "ALL"}
        onValueChange={onApprovalStatusChange}
      >
        <SelectTrigger className="w-[145px] h-9">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Phê duyệt" />
          </div>
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
