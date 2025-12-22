import type { Metadata } from "next";
import NotebookTabs from "@/components/users/notebook";

export const metadata: Metadata = {
  title: "Notebooks",
  description:
    "Khám phá và quản lý các nhóm notebook. Tìm kiếm nhóm cộng đồng, nhóm đã tham gia, nhóm bạn bè và notebook cá nhân.",
  keywords: [
    "notebooks",
    "nhóm cộng đồng",
    "nhóm đã tham gia",
    "notebook cá nhân",
    "chia sẻ kiến thức",
  ],
  openGraph: {
    title: "Notebooks - EduGenius",
    description: "Khám phá và quản lý các nhóm notebook trên EduGenius.",
    type: "website",
  },
};

export default function NotebookPage() {
  return <NotebookTabs />;
}
