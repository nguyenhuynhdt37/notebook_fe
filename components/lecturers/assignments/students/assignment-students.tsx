"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentList from "./student-list";

interface AssignmentStudentsProps {
  assignmentId: string;
}

export default function AssignmentStudents({
  assignmentId,
}: AssignmentStudentsProps) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sinh viên</h1>
            <p className="text-muted-foreground">
              Danh sách sinh viên trong môn học
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <StudentList assignmentId={assignmentId} />
    </div>
  );
}
