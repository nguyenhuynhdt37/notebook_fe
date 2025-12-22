"use client";

import { GraduationCap, Calendar } from "lucide-react";
import { LecturerStudentResponse } from "@/types/lecturer";

interface StudentRowProps {
  student: LecturerStudentResponse;
}

export default function StudentRow({ student }: StudentRowProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
        {student.firstName?.charAt(0) || "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {student.fullName}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GraduationCap className="size-3" />
          <span>{student.studentCode}</span>
          {student.dob && (
            <>
              <span>•</span>
              <Calendar className="size-3" />
              <span>{new Date(student.dob).toLocaleDateString("vi-VN")}</span>
            </>
          )}
        </div>
      </div>

      {/* Class */}
      <code className="hidden sm:block rounded bg-muted px-2 py-1 text-xs font-mono">
        {student.classCode}
      </code>
    </div>
  );
}
