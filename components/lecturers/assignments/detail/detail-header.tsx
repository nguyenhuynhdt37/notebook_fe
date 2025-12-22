"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LecturerAssignmentResponse } from "@/types/lecturer";
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_VARIANTS,
  TERM_STATUS_LABELS,
} from "@/types/lecturer";

interface DetailHeaderProps {
  data: LecturerAssignmentResponse;
}

export default function DetailHeader({ data }: DetailHeaderProps) {
  const statusLabel =
    APPROVAL_STATUS_LABELS[data.approvalStatus] || "Chờ duyệt";
  const statusVariant =
    APPROVAL_STATUS_VARIANTS[data.approvalStatus] || "secondary";
  const termLabel = TERM_STATUS_LABELS[data.termStatus] || "Đang diễn ra";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative gradient */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-muted rounded-full blur-3xl opacity-50" />

      <div className="relative flex items-start gap-4">
        {/* Back button */}
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/lecturer/assignments">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <code className="rounded-md bg-background/80 backdrop-blur-sm border px-2.5 py-1 text-sm font-mono font-semibold">
              {data.subjectCode}
            </code>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="size-3" />
              {data.subjectCredit} tín chỉ
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {data.subjectName}
          </h1>

          {/* Term info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span className="font-medium">{termLabel}</span>
              <span>•</span>
              <span>{data.termName}</span>
            </div>
            <span className="hidden sm:inline">
              ({new Date(data.termStartDate).toLocaleDateString("vi-VN")} -{" "}
              {new Date(data.termEndDate).toLocaleDateString("vi-VN")})
            </span>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {data.notebookId && (
              <DropdownMenuItem asChild>
                <Link href={`/notebooks/${data.notebookId}`}>
                  <ExternalLink className="mr-2 size-4" />
                  Mở Notebook
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
