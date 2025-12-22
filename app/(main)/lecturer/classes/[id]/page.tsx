import ClassDetailView from "@/components/lecturers/classes/detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết lớp học phần | Lecturer",
  description: "Thông tin chi tiết và danh sách sinh viên của lớp học phần",
};

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetailView id={id} />;
}
