import { ExamStart } from "@/components/users/exams/exam-start";
import { use } from "react";

interface ExamStartPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExamStartPage({ params }: ExamStartPageProps) {
  const resolvedParams = use(params);
  return <ExamStart examId={resolvedParams.id} />;
}