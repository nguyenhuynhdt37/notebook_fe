import ClassMembers from "@/components/lecturers/classes/members";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách sinh viên | Lecturer",
  description: "Danh sách sinh viên trong lớp học phần",
};

export default async function ClassMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container py-6 space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href={`/lecturer/classes/${id}`}>
              <ArrowLeft className="mr-2 size-4" />
              Quay lại
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Danh sách sinh viên</h1>
          <p className="text-muted-foreground">
            Quản lý sinh viên trong lớp học phần
          </p>
        </div>
      </div>

      <ClassMembers classId={id} />
    </div>
  );
}
