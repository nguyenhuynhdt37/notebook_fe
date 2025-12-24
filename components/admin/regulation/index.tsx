"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import RegulationNotebookInfo from "./regulation-notebook-info";

export default function RegulationManagement() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quy chế & Công văn
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý tài liệu quy chế và công văn của nhà trường
          </p>
        </div>
        <Button onClick={() => router.push("/admin/regulation/files")}>
          <FileText className="size-4" />
          Danh sách File
        </Button>
      </div>

      <RegulationNotebookInfo />
    </div>
  );
}
