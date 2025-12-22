import TermDetail from "@/components/admin/terms/term-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TermDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TermDetail termId={id} />;
}
