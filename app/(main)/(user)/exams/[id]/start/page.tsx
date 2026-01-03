import { ExamStart } from "@/components/users/exams/exam-start";

interface ExamStartPageProps {
  params: {
    id: string;
  };
}

export default function ExamStartPage({ params }: ExamStartPageProps) {
  return <ExamStart examId={params.id} />;
}