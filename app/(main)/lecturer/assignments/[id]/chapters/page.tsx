import ChapterBoard from "@/components/lecturers/assignments/chapter/chapter-board";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ChapterBoard courseId={id} />;
}
