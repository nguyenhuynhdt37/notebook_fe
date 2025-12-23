import ClassManagementView from "@/components/lecturers/class-management/class-management-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Lớp học phần | Lecturer",
  description: "Tạo lớp mới và import sinh viên từ Excel",
};

export default function ClassManagementPage() {
  return <ClassManagementView />;
}