import FilePreview from "@/components/admin/notebooks/files/file-preview";

interface FilePreviewPageProps {
  params: Promise<{ id: string; fileId: string }>;
}

export default async function FilePreviewPage({
  params,
}: FilePreviewPageProps) {
  const { id, fileId } = await params;
  return <FilePreview notebookId={id} fileId={fileId} />;
}

