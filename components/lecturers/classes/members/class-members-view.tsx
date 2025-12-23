"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassMembers from "./index";

interface ClassMembersViewProps {
  classId: string;
}

export default function ClassMembersView({ classId }: ClassMembersViewProps) {
  const router = useRouter();

  return (
    <div className="container py-6 space-y-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Danh sách sinh viên
            </h1>
            <p className="text-sm text-muted-foreground">
              Quản lý sinh viên trong lớp học phần
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <ClassMembers classId={classId} />
    </div>
  );
}
