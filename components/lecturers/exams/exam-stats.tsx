"use client";

import { FileText, FileClock, FileCheck, Radio } from "lucide-react";

interface ExamStatsProps {
  totalExams: number;
  draftExams: number;
  publishedExams: number;
  activeExams: number;
}

export function ExamStats({
  totalExams,
  draftExams,
  publishedExams,
  activeExams,
}: ExamStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{totalExams}</span>
        <span className="text-muted-foreground">đề thi</span>
      </div>
      <div className="flex items-center gap-2">
        <FileClock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{draftExams}</span>
        <span className="text-muted-foreground">nháp</span>
      </div>
      <div className="flex items-center gap-2">
        <FileCheck className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{publishedExams}</span>
        <span className="text-muted-foreground">đã xuất bản</span>
      </div>
      {activeExams > 0 && (
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-green-600 animate-pulse" />
          <span className="font-semibold text-green-600">{activeExams}</span>
          <span className="text-muted-foreground">đang thi</span>
        </div>
      )}
    </div>
  );
}