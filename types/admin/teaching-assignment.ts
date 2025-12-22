// ============================================================
// Teaching Assignment Types - Quản lý Phân công Giảng dạy
// ============================================================

import { TermResponse } from "./term";
import { SubjectResponse } from "./subject";
import { LecturerResponse } from "./lecturer";

// === RESPONSE ===

export interface AssignmentResponse {
  id: string;
  term: TermResponse;
  subject: SubjectResponse;
  teacher: LecturerResponse;
  status: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  note: string | null;
  classCount: number;
  studentCount: number;
}

// === REQUEST ===

export interface CreateAssignmentRequest {
  termId: string;
  subjectId: string;
  teacherUserId: string;
  note?: string;
}

export interface ApproveAssignmentRequest {
  status: "APPROVED" | "REJECTED";
  note?: string;
}

// === LABELS ===

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export const APPROVAL_STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};
