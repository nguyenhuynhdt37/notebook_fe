import LecturerClassesView from "@/components/lecturers/classes/lecturer-classes-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lớp học phần | Lecturer",
  description: "Quản lý danh sách lớp học phần của giảng viên",
};

export default function LecturerClassesPage() {
  return <LecturerClassesView />;
}
