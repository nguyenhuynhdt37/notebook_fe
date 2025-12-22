"use client";

import {
  Layers,
  Users,
  FileText,
  HelpCircle,
  BookOpen,
  Video,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { LecturerAssignmentResponse } from "@/types/lecturer";

interface DetailStatsProps {
  data: LecturerAssignmentResponse;
}

const STATS_CONFIG = [
  { key: "classCount", label: "Lớp học phần", icon: Layers, color: "bg-muted" },
  { key: "studentCount", label: "Sinh viên", icon: Users, color: "bg-muted" },
  { key: "fileCount", label: "Tài liệu", icon: FileText, color: "bg-muted" },
  { key: "quizCount", label: "Câu hỏi", icon: HelpCircle, color: "bg-muted" },
  {
    key: "flashcardCount",
    label: "Flashcard",
    icon: BookOpen,
    color: "bg-muted",
  },
  {
    key: "summaryCount",
    label: "Tóm tắt",
    icon: StickyNote,
    color: "bg-muted",
  },
  { key: "videoCount", label: "Video", icon: Video, color: "bg-muted" },
] as const;

export default function DetailStats({ data }: DetailStatsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {STATS_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value = data[
          stat.key as keyof LecturerAssignmentResponse
        ] as number;

        return (
          <div
            key={stat.key}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
          >
            {/* Background pattern */}
            <div className="absolute -right-2 -top-2 opacity-[0.05]">
              <Icon className="size-12" />
            </div>

            <div className="relative flex items-center gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
