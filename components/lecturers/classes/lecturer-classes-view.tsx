"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ClassList from "@/components/lecturers/classes/class-list";
import LecturerTermSelect from "@/components/lecturers/shared/lecturer-term-select";
import LecturerAssignmentSelect from "@/components/lecturers/shared/lecturer-assignment-select";
import ClassActionsDropdown, { ClassActionFlow } from "./class-actions-dropdown";

// Import flows from class-management
import ImportStudentsFlow from "@/components/lecturers/class-management/import-students-flow";
import ManualCreateClassFlow from "@/components/lecturers/class-management/manual-create-class-flow";
import ManualAddStudentFlow from "@/components/lecturers/class-management/manual-add-student-flow";

export default function LecturerClassesView() {
  const [termId, setTermId] = useState<string>("");
  const [activeFlow, setActiveFlow] = useState<ClassActionFlow | null>(null);
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

  const handleBack = () => setActiveFlow(null);

  // Render active flow
  if (activeFlow === "import") {
    return <ImportStudentsFlow onBack={handleBack} />;
  }
  if (activeFlow === "manual-create") {
    return <ManualCreateClassFlow onBack={handleBack} />;
  }
  if (activeFlow === "manual-add") {
    return <ManualAddStudentFlow onBack={handleBack} />;
  }

  return (
    <div className="container py-6 space-y-6 mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lớp học phần</h1>
          <p className="text-muted-foreground">
            Quản lý các lớp học phần và sinh viên
          </p>
        </div>

        {/* Actions Dropdown */}
        <ClassActionsDropdown onActionSelect={setActiveFlow} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-[200px]">
          <LecturerTermSelect
            value={termId}
            onValueChange={(val) => {
              setTermId(val || "");
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

      <ClassList
        termId={termId}
        assignmentId={selectedAssignmentId || undefined}
        showAddButton={false}
      />
    </div>
  );
}
