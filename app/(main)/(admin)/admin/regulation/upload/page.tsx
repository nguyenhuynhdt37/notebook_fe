import type { Metadata } from "next";
import RegulationFileUpload from "@/components/admin/regulation/regulation-upload";

export const metadata: Metadata = {
  title: "Upload File - Quy chế & Công văn",
  description: "Upload file PDF/DOCX cho notebook quy chế và văn bản",
};

export default function RegulationUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
        <p className="text-muted-foreground mt-1.5">
          Upload file PDF hoặc DOCX cho công văn và quy chế
        </p>
      </div>
      <RegulationFileUpload />
    </div>
  );
}
