import TermEdit from "@/components/admin/terms/term-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TermEditPage({ params }: PageProps) {
  const { id } = await params;
  return <TermEdit termId={id} />;
}
