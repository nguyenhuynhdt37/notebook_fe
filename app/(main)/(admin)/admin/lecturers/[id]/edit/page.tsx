import LecturerEdit from "@/components/admin/lecturers/lecturer-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LecturerEditPage({ params }: PageProps) {
  const { id } = await params;
  return <LecturerEdit lecturerId={id} />;
}
