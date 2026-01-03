import { ExamResult } from "@/components/users/exams/exam-result";

interface ExamResultPageProps {
  params: {
    id: string;
  };
}

export default function ExamResultPage({ params }: ExamResultPageProps) {
  return <ExamResult examId={params.id} />;
}