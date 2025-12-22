"use client";

import { Calendar, Users, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassSectionData {
  id: string;
  subjectName: string;
  classCode: string;
  schedule: string;
  room: string;
  studentCount: number;
}

interface ClassSectionCardProps {
  data: ClassSectionData;
}

export default function ClassSectionCard({ data }: ClassSectionCardProps) {
  return (
    <div className="flex items-center justify-between py-4 px-4 rounded-lg border border-border/50 bg-card hover:border-foreground/20 transition-all duration-200 group">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">
            {data.subjectName}
          </h4>
          <Badge variant="secondary" className="text-xs font-normal">
            {data.classCode}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {data.schedule} • {data.room}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {data.studentCount} sinh viên
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
          <DropdownMenuItem>Điểm danh</DropdownMenuItem>
          <DropdownMenuItem>Quản lý bài tập</DropdownMenuItem>
          <DropdownMenuItem>Danh sách sinh viên</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
