import { Users } from "lucide-react";

interface MemberEmptyProps {
  hasSearch: boolean;
}

export default function MemberEmpty({ hasSearch }: MemberEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <Users className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {hasSearch ? "Không tìm thấy sinh viên" : "Chưa có sinh viên"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {hasSearch
          ? "Thử tìm kiếm với từ khóa khác"
          : "Lớp này chưa có sinh viên nào"}
      </p>
    </div>
  );
}
