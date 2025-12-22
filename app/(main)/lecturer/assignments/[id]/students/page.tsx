import AssignmentStudents from "@/components/lecturers/assignments/students/assignment-students";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AssignmentStudents assignmentId={id} />;
}
