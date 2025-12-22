"use client";

import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassList from "@/components/lecturers/classes/class-list";

interface AssignmentClassesProps {
  assignmentId: string;
}

export default function AssignmentClasses({
  assignmentId,
}: AssignmentClassesProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/lecturer/assignments/${assignmentId}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Lớp học phần</h1>
            <p className="text-muted-foreground">
              Danh sách các lớp bạn phụ trách
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ClassList assignmentId={assignmentId} />
    </div>
  );
}
