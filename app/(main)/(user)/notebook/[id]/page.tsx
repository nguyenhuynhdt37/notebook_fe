import type { Metadata } from "next";
import NotebookDetail from "@/components/user/notebook/detail";

interface NotebookDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NotebookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Chi tiết nhóm cộng đồng`,
    description:
      "Xem thông tin chi tiết, thống kê, tin nhắn và tệp tin gần đây của nhóm cộng đồng trên Notebooks AI.",
  };
}

export default async function NotebookDetailPage({
  params,
}: NotebookDetailPageProps) {
  const { id } = await params;
  return <NotebookDetail notebookId={id} />;
}
