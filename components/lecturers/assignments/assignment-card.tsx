"use client";

import Link from "next/link";
import {
  Users,
  Layers,
  Calendar,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_VARIANTS,
  TERM_STATUS_LABELS,
} from "@/types/lecturer";

interface AssignmentCardProps {
  id: string;
  subjectCode: string;
  subjectName: string;
  termName: string;
  approvalStatus: string;
  classCount: number;
  studentCount: number;
  termStatus: string;
}

export default function AssignmentCard({
  id,
  subjectCode,
  subjectName,
  termName,
  approvalStatus,
  classCount,
  studentCount,
  termStatus,
}: AssignmentCardProps) {
  const statusLabel = APPROVAL_STATUS_LABELS[approvalStatus] || "Chờ duyệt";
  const statusVariant = APPROVAL_STATUS_VARIANTS[approvalStatus] || "secondary";
  const termLabel = TERM_STATUS_LABELS[termStatus] || "Đang diễn ra";

  return (
    <Link
      href={`/lecturer/assignments/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:border-foreground/30 hover:shadow-lg aspect-square"
    >
      {/* Dot Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-muted rounded-full blur-2xl opacity-60" />

      {/* Icon watermark */}
      <div className="absolute right-3 bottom-16 opacity-[0.08]">
        <GraduationCap className="size-16" />
      </div>

      {/* Header: Code + Status */}
      <div className="relative flex items-center justify-between mb-2 z-10">
        <code className="rounded-md bg-background/80 backdrop-blur-sm border px-2 py-0.5 text-[11px] font-mono font-semibold">
          {subjectCode}
        </code>
        <Badge variant={statusVariant} className="text-[10px] px-2">
          {statusLabel}
        </Badge>
      </div>

      {/* Subject Name */}
      <h3 className="relative flex-1 font-bold text-sm text-foreground leading-snug line-clamp-3 group-hover:underline decoration-foreground/40 underline-offset-2 z-10">
        {subjectName}
      </h3>

      {/* Term Info */}
      <div className="relative flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2 mb-3 z-10">
        <Calendar className="size-3.5" />
        <span className="font-medium">{termLabel}</span>
        <span className="opacity-50">•</span>
        <span className="truncate">{termName}</span>
      </div>

      {/* Stats Footer */}
      <div className="relative flex items-center justify-between pt-3 border-t border-foreground/10 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1">
            <Layers className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-bold">{classCount}</span>
            <span className="text-[10px] text-muted-foreground">lớp</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-md px-2 py-1">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-bold">{studentCount}</span>
            <span className="text-[10px] text-muted-foreground">SV</span>
          </div>
        </div>
        <div className="flex items-center justify-center size-7 rounded-full bg-foreground/5 group-hover:bg-foreground group-hover:text-background transition-all">
          <ArrowUpRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
