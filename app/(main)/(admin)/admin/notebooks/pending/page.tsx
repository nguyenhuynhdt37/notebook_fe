import { Metadata } from "next";
import PendingRequests from "@/components/admin/notebooks/pending";

export const metadata: Metadata = {
  title: "Yêu cầu tham gia | Admin | Notebooks AI",
  description: "Quản lý các yêu cầu tham gia notebook",
};

export default function PendingRequestsPage() {
  return <PendingRequests />;
}

