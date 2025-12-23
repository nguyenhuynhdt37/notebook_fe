"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CreateClassForm from "./create-class-form";
import PreviewModal from "./preview-modal";
import ImportResult from "./import-result";
import ProgressSteps from "./progress-steps";

interface CreateClassFlowProps {
  onBack: () => void;
}

interface PreviewData {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{
    rowNumber: number;
    studentCode: string;
    fullName: string;
    reason: string;
  }>;
  students: Array<{
    studentCode: string;
    fullName: string;
    dateOfBirth: string;
  }>;
}

interface ImportResultData {
  totalRows: number;
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  duplicates: Array<{
    rowNumber: number;
    studentCode: string;
    fullName: string;
    reason: string;
  }>;
  errors: Array<{
    rowNumber: number;
    studentCode: string;
    fullName: string;
    reason: string;
  }>;
}

export default function CreateClassFlow({ onBack }: CreateClassFlowProps) {
  const [step, setStep] = useState<"form" | "preview" | "result">("form");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [resultData, setResultData] = useState<ImportResultData | null>(null);
  const [formData, setFormData] = useState<{
    file: File | null;
    className: string;
    subjectId: string;
    teachingAssignmentId: string;
  }>({
    file: null,
    className: "",
    subjectId: "",
    teachingAssignmentId: "",
  });

  const steps = [
    { title: "Thông tin lớp", description: "Điền thông tin và upload Excel" },
    { title: "Xem trước", description: "Kiểm tra dữ liệu sinh viên" },
    { title: "Kết quả", description: "Hoàn thành tạo lớp" },
  ];

  const getCurrentStep = () => {
    switch (step) {
      case "form": return 1;
      case "preview": return 2;
      case "result": return 3;
      default: return 1;
    }
  };

  const handlePreview = (data: PreviewData, form: typeof formData) => {
    setPreviewData(data);
    setFormData(form);
    setStep("preview");
  };

  const handleCreateClass = (result: ImportResultData) => {
    setResultData(result);
    setStep("result");
  };

  const handleStartOver = () => {
    setStep("form");
    setPreviewData(null);
    setResultData(null);
    setFormData({
      file: null,
      className: "",
      subjectId: "",
      teachingAssignmentId: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo lớp mới từ Excel</h1>
          <p className="text-muted-foreground">
            {step === "form" && "Điền thông tin lớp và upload file Excel"}
            {step === "preview" && "Xem trước dữ liệu và xác nhận tạo lớp"}
            {step === "result" && "Kết quả import sinh viên"}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <ProgressSteps steps={steps} currentStep={getCurrentStep()} />

      {/* Content */}
      {step === "form" && (
        <CreateClassForm onPreview={handlePreview} />
      )}

      {step === "preview" && previewData && (
        <PreviewModal
          data={previewData}
          formData={formData}
          onBack={() => setStep("form")}
          onConfirm={handleCreateClass}
        />
      )}

      {step === "result" && resultData && (
        <ImportResult
          data={resultData}
          onStartOver={handleStartOver}
          onViewClasses={onBack}
        />
      )}
    </div>
  );
}