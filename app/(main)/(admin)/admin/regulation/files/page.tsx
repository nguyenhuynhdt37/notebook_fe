import type { Metadata } from "next";
import RegulationFilesList from "@/components/admin/regulation/regulation-files";

export const metadata: Metadata = {
  title: "Danh sách File - Quy chế & Công văn",
  description: "Quản lý files công văn và quy chế của nhà trường",
};

export default function RegulationFilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách File</h1>
        <p className="text-muted-foreground mt-1.5">
          Quản lý files công văn và quy chế đã upload
        </p>
      </div>
      <RegulationFilesList />
    </div>
  );
}
