import NotebookDetail from "@/components/admin/notebooks/notebook-detail";

interface NotebookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotebookDetailPage({
  params,
}: NotebookDetailPageProps) {
  const { id } = await params;
  return <NotebookDetail notebookId={id} />;
}
