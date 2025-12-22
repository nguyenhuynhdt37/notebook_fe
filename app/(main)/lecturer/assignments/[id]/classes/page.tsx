import AssignmentClasses from "@/components/lecturers/assignments/classes/assignment-classes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AssignmentClasses assignmentId={id} />;
}
