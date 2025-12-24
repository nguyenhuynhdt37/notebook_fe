import type { Metadata } from "next";
import RegulationNotebookEdit from "@/components/admin/regulation/regulation-edit";

export const metadata: Metadata = {
  title: "Chỉnh sửa Notebook - Quy chế & Công văn",
  description: "Cập nhật thông tin notebook quy chế và văn bản nhà trường",
};

export default function RegulationEditPage() {
  return <RegulationNotebookEdit />;
}
