import { Metadata } from "next";
import ExamPreview from "@/components/lecturers/exams/exam-preview";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Xem trước đề thi",
    description: "Xem trước nội dung đề thi với đáp án",
  };
}

export default async function ExamPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return <ExamPreview examId={id} />;
}