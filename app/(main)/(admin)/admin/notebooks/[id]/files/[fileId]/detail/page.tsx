import FileDetail from "@/components/admin/notebooks/files/detail";

interface PageProps {
  params: Promise<{
    id: string;
    fileId: string;
  }>;
}

export default async function FileDetailPage({ params }: PageProps) {
  const { id, fileId } = await params;
  return <FileDetail notebookId={id} fileId={fileId} />;
}
