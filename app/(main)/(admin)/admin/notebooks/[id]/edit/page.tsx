import NotebookEdit from "@/components/admin/notebooks/notebook-edit";

interface NotebookEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotebookEditPage({
  params,
}: NotebookEditPageProps) {
  const { id } = await params;
  return <NotebookEdit notebookId={id} />;
}
