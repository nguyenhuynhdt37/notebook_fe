import { ExamTaking } from "@/components/users/exams/exam-taking";
import { use } from "react";

interface ExamTakingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExamTakingPage({ params }: ExamTakingPageProps) {
  const resolvedParams = use(params);
  return <ExamTaking examId={resolvedParams.id} />;
}