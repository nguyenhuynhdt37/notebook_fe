import SubjectDetail from "@/components/admin/subjects/subject-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SubjectDetail subjectId={id} />;
}
