import QuickAddStudentView from "@/components/lecturers/classes/members/quick-add-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thêm sinh viên | Lecturer",
  description: "Thêm sinh viên nhanh vào lớp học phần",
};

export default async function QuickAddStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuickAddStudentView classId={id} />;
}
