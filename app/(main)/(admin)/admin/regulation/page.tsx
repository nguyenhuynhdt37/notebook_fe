import type { Metadata } from "next";
import RegulationManagement from "@/components/admin/regulation";

export const metadata: Metadata = {
  title: "Quy chế & Công văn - Admin",
  description: "Quản lý tài liệu quy chế và công văn của nhà trường",
};

export default function RegulationPage() {
  return <RegulationManagement />;
}
