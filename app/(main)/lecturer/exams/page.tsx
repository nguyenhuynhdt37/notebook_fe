import { Metadata } from "next";
import ExamDashboard from "@/components/lecturers/exams/exam-dashboard";

export const metadata: Metadata = {
  title: "Quản lý đề thi",
  description: "Tạo và quản lý đề thi trực tuyến",
};

export default function ExamsPage() {
  return <ExamDashboard />;
}