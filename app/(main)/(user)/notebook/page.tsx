import type { Metadata } from "next";
import NotebookTabs from "@/components/user/notebook";

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
    title: "Notebooks - Notebooks AI",
    description: "Khám phá và quản lý các nhóm notebook trên Notebooks AI.",
    type: "website",
  },
};

export default function NotebookPage() {
  return <NotebookTabs />;
}
