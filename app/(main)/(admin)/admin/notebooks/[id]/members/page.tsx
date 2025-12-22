import type { Metadata } from "next";
import NotebookMembers from "@/components/admin/notebooks/members";

export const metadata: Metadata = {
  title: "Thành viên - EduGenius",
  description: "Quản lý danh sách thành viên của notebook",
};

interface NotebookMembersPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotebookMembersPage({
  params,
}: NotebookMembersPageProps) {
  return <NotebookMembers />;
}

