import { ExamResult } from "@/components/users/exams/exam-result";
import { use } from "react";

interface ExamResultPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExamResultPage({ params }: ExamResultPageProps) {
  const resolvedParams = use(params);
  return <ExamResult examId={resolvedParams.id} />;
}