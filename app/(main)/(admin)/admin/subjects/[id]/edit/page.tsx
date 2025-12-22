import SubjectEdit from "@/components/admin/subjects/subject-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectEditPage({ params }: PageProps) {
  const { id } = await params;
  return <SubjectEdit subjectId={id} />;
}
