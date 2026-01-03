import { ExamTaking } from "@/components/users/exams/exam-taking";

interface ExamTakingPageProps {
  params: {
    id: string;
  };
}

export default function ExamTakingPage({ params }: ExamTakingPageProps) {
  return <ExamTaking examId={params.id} />;
}