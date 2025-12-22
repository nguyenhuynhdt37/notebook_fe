import MajorEdit from "@/components/admin/majors/major-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MajorEditPage({ params }: PageProps) {
  const { id } = await params;
  return <MajorEdit majorId={id} />;
}
