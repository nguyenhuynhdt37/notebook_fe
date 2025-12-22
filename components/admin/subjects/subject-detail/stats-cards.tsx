import {
  BookOpen,
  Activity,
  GraduationCap,
  UserCheck,
  Users,
} from "lucide-react";
import { SubjectDetailResponse } from "@/types/admin/subject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  subject: SubjectDetailResponse;
}

export default function StatsCards({ subject }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tín chỉ
          </CardTitle>
          <BookOpen className="size-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{subject.credit ?? "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            TC đào tạo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trạng thái
          </CardTitle>
          <Activity className="size-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Badge
            variant={subject.isActive ? "default" : "secondary"}
            className="rounded-sm text-[10px] h-5 font-normal px-1.5"
          >
            {subject.isActive ? "Đang hoạt động" : "Tạm ngưng"}
          </Badge>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            Hệ thống
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ngành học
          </CardTitle>
          <GraduationCap className="size-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{subject.majorCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Ngành áp dụng
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phân công
          </CardTitle>
          <UserCheck className="size-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{subject.assignmentCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Lượt đào tạo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sinh viên
          </CardTitle>
          <Users className="size-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold">{subject.studentCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            Đã/đang học
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
