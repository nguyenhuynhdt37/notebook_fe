"use client";

import { Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LecturerClassResponse } from "@/types/lecturer";

const DAY_OF_WEEK_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "CN",
};

interface ClassCardProps {
  data: LecturerClassResponse;
}

export default function ClassCard({ data }: ClassCardProps) {
  const dayLabel = DAY_OF_WEEK_LABELS[data.dayOfWeek] || `T${data.dayOfWeek}`;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-foreground/30 hover:shadow-lg">
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
        }}
      />

      {/* Decorative gradient corner */}
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-muted rounded-full blur-2xl opacity-50" />

      {/* Icon watermark */}
      <div className="absolute right-2 top-12 opacity-[0.06]">
        <BookOpen className="size-14" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3 z-10">
        <code className="rounded-md bg-background/80 backdrop-blur-sm border px-2 py-1 text-xs font-mono font-semibold">
          {data.classCode}
        </code>
        <Badge
          variant={data.isActive ? "default" : "secondary"}
          className="text-[10px]"
        >
          {data.isActive ? "Hoạt động" : "Tạm dừng"}
        </Badge>
      </div>

      {/* Subject Name */}
      <h3 className="relative font-bold text-sm text-foreground leading-snug mb-3 line-clamp-2 z-10">
        {data.subjectName}
      </h3>

      {/* Info Grid */}
      <div className="relative grid grid-cols-2 gap-2 mb-3 z-10">
        <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{dayLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Tiết {data.periods}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs">
          <MapPin className="size-3.5 text-muted-foreground" />
          <span className="font-medium truncate">{data.room || "TBD"}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1.5 text-xs">
          <Users className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{data.studentCount} SV</span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative pt-2 border-t border-foreground/10 text-[11px] text-muted-foreground z-10">
        <span className="truncate">{data.termName}</span>
      </div>
    </div>
  );
}
