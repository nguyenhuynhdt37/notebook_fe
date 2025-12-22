import AssignmentDetail from "@/components/lecturers/assignments/detail/assignment-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AssignmentDetail assignmentId={id} />;
}
