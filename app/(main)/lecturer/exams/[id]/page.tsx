import { Metadata } from "next";
import ExamDetail from "@/components/lecturers/exams/exam-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Chi tiết đề thi",
    description: "Xem và quản lý chi tiết đề thi",
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ExamDetail examId={id} />;
}