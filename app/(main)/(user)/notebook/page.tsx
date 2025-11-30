import type { Metadata } from "next";
import Notebooks from "@/components/user/notebook/available";

export const metadata: Metadata = {
  title: "Nhóm cộng đồng",
  description:
    "Khám phá và tham gia các nhóm cộng đồng trên Notebooks AI. Tìm kiếm nhóm theo tiêu đề, mô tả. Sắp xếp theo ngày tạo, số thành viên hoặc tên nhóm. Tham gia cộng đồng để chia sẻ và học hỏi kiến thức.",
  keywords: [
    "nhóm cộng đồng",
    "cộng đồng notebook",
    "tham gia nhóm",
    "notebook cộng đồng",
    "chia sẻ kiến thức",
  ],
  openGraph: {
    title: "Nhóm cộng đồng - Notebooks AI",
    description:
      "Khám phá và tham gia các nhóm cộng đồng trên Notebooks AI. Tìm kiếm và tham gia nhóm phù hợp với bạn.",
    type: "website",
  },
};

export default function NotebookPage() {
  return <Notebooks />;
}
