import MajorDetail from "@/components/admin/majors/major-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MajorDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <MajorDetail majorId={id} />;
}
