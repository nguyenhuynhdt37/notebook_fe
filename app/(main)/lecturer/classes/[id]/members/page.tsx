import ClassMembersView from "@/components/lecturers/classes/members/class-members-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách sinh viên | Lecturer",
  description: "Danh sách sinh viên trong lớp học phần",
};

export default async function ClassMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassMembersView classId={id} />;
}
