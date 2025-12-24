"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassList from "@/components/lecturers/classes/class-list";

interface AssignmentClassesProps {
  assignmentId: string;
}

export default function AssignmentClasses({
  assignmentId,
}: AssignmentClassesProps) {
  const router = useRouter();

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lớp học phần</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý các lớp học phần của phân công
            </p>
          </div>
        </div>
      </div>

      {/* Class List */}
      <ClassList assignmentId={assignmentId} showAddButton={true} />
    </div>
  );
}
