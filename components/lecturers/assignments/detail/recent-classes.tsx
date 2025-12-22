"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LecturerAssignmentResponse } from "@/types/lecturer";

interface RecentClassesProps {
  data: LecturerAssignmentResponse;
}

const DAY_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "CN",
};

export default function RecentClasses({ data }: RecentClassesProps) {
  const classes = data.recentClasses || [];

  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Lớp học phần</h2>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href={`/lecturer/assignments/${data.id}/classes`}>
            Xem tất cả
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <code className="rounded bg-muted px-2 py-1 text-sm font-mono font-semibold">
                {cls.classCode}
              </code>
              <Badge
                variant={cls.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {cls.isActive ? "Hoạt động" : "Tạm dừng"}
              </Badge>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{DAY_LABELS[cls.dayOfWeek] || `T${cls.dayOfWeek}`}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" />
                <span>Tiết {cls.periods}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" />
                <span>{cls.room || "TBD"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                <span>{cls.studentCount} SV</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
