import { Metadata } from "next";
import { cookies } from "next/headers";
import { fetcher } from "@/api/server/fetcher";
import { ExamByClass } from "@/components/lecturers/exams/exam-by-class";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Đề thi lớp học",
    description: "Quản lý đề thi cho lớp học",
  };
}

export default async function ClassExamsPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  
  // Fetch class info
  let className = "Lớp học";
  try {
    const res = await fetcher(`/api/classes/${id}`, cookieStore);
    if (res.ok) {
      const classData = await res.json();
      className = classData.name;
    }
  } catch (error) {
    console.error("Error fetching class:", error);
  }

  return <ExamByClass classId={id} className={className} />;
}