// ============================================================
// Lecturer Assignment Types - Phân công giảng viên
// ============================================================

// === RESPONSE ===

export interface LecturerAssignmentResponse {
  id: string;
  subjectCode: string;
  subjectName: string;
  termName: string;
  status: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  classCount: number;
  studentCount: number;
  createdAt: string;
  termStatus: "ACTIVE" | "UPCOMING" | "PAST";
}

export interface LecturerAssignmentPagedResponse {
  items: LecturerAssignmentResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// === REQUEST ===

export interface RequestTeachingRequest {
  termId: string;
  subjectId: string;
  note?: string;
}

// === LABELS ===

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export const APPROVAL_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export const TERM_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang diễn ra",
  UPCOMING: "Sắp tới",
  PAST: "Đã kết thúc",
};
