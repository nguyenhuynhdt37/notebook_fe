"use client";

import { useState, useEffect } from "react";
import ClassList from "@/components/lecturers/classes/class-list";
import LecturerTermSelect from "@/components/lecturers/shared/lecturer-term-select";
import LecturerAssignmentSelect from "@/components/lecturers/shared/lecturer-assignment-select";

import { useSearchParams } from "next/navigation";

export default function LecturerClassesView() {
  const [termId, setTermId] = useState<string>("");
  const searchParams = useSearchParams();
  const urlAssignmentId = searchParams.get("assignmentId");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(urlAssignmentId);

  useEffect(() => {
    if (urlAssignmentId) {
      setSelectedAssignmentId(urlAssignmentId);
    }
  }, [urlAssignmentId]);

  return (
    <div className="container py-6 space-y-6 mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lớp học phần</h1>
          <p className="text-muted-foreground">
            Danh sách các lớp học phần bạn đang giảng dạy
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="w-full">
            <LecturerTermSelect
              value={termId}
              onValueChange={(val) => {
                setTermId(val || "");
                // Reset assignment if term changes? Maybe not necessarily, but good UX usually.
                // setSelectedAssignmentId(null);
              }}
              placeholder="Tất cả học kỳ"
            />
          </div>
          <div className="w-full sm:w-[250px]">
            <LecturerAssignmentSelect
              value={selectedAssignmentId}
              onChange={setSelectedAssignmentId}
              termId={termId}
              placeholder="Tất cả môn học"
            />
          </div>
        </div>
      </div>

      <ClassList
        termId={termId}
        assignmentId={selectedAssignmentId || undefined}
        showAddButton={false}
      />
    </div>
  );
}
