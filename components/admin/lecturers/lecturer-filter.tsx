"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import OrgUnitSelect from "../shared/org-unit-select";

interface LecturerFilterProps {
  q: string;
  orgUnitId: string;
  onQChange: (value: string) => void;
  onOrgUnitChange: (value: string) => void;
}

export default function LecturerFilter({
  q,
  orgUnitId,
  onQChange,
  onOrgUnitChange,
}: LecturerFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, email, mã GV..."
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          className="pl-9 w-[280px]"
        />
      </div>
      <div className="w-[280px]">
        <OrgUnitSelect
          value={orgUnitId || null}
          onChange={(val) => onOrgUnitChange(val || "")}
          placeholder="Lọc theo đơn vị"
        />
      </div>
    </div>
  );
}
