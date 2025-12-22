"use client";

import { GraduationCap, Calendar } from "lucide-react";
import { LecturerStudentResponse } from "@/types/lecturer";

interface MemberRowProps {
  member: LecturerStudentResponse;
}

export default function MemberRow({ member }: MemberRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 transition-colors items-center">
      {/* Name & Avatar */}
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {member.firstName?.charAt(0) || "?"}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">
            {member.fullName}
          </p>
          <p className="text-xs text-muted-foreground sm:hidden">
            {member.studentCode}
          </p>
        </div>
      </div>

      {/* Student Code */}
      <div className="col-span-3 hidden sm:flex items-center gap-1.5 text-sm">
        <GraduationCap className="size-4 text-muted-foreground" />
        <span className="font-mono">{member.studentCode}</span>
      </div>

      {/* DOB */}
      <div className="col-span-2 hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="size-4" />
        <span>
          {member.dob ? new Date(member.dob).toLocaleDateString("vi-VN") : "-"}
        </span>
      </div>

      {/* Class Code */}
      <div className="col-span-2 hidden lg:block">
        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
          {member.classCode}
        </code>
      </div>
    </div>
  );
}
