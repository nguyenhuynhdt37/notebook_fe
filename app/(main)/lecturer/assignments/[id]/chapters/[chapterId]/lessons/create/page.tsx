import LessonCreate from "@/components/lecturers/assignments/chapter/lesson/lesson-create";

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function LessonCreatePage({ params }: PageProps) {
  const { id, chapterId } = await params;
  return <LessonCreate assignmentId={id} chapterId={chapterId} />;
}
