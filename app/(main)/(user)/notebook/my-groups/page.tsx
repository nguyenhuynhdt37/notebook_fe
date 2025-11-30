import type { Metadata } from "next";
import MyGroups from "@/components/user/notebook/my-groups";

export const metadata: Metadata = {
  title: "Nhóm của tôi",
  description:
    "Quản lý các nhóm cộng đồng bạn đã tham gia. Xem danh sách nhóm đã tham gia, đang chờ duyệt, bị từ chối hoặc bị chặn. Tìm kiếm và sắp xếp nhóm theo tiêu đề, ngày tham gia hoặc số thành viên.",
  keywords: [
    "nhóm của tôi",
    "quản lý nhóm",
    "nhóm đã tham gia",
    "nhóm đang chờ duyệt",
  ],
  openGraph: {
    title: "Nhóm của tôi - Notebooks AI",
    description:
      "Quản lý các nhóm cộng đồng bạn đã tham gia trên Notebooks AI.",
    type: "website",
  },
};

export default function MyGroupsPage() {
  return <MyGroups />;
}
