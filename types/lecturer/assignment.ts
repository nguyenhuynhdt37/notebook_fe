// ============================================================
// Lecturer Assignment Types - Phân công giảng viên
// ============================================================

// === RESPONSE ===

export interface LecturerAssignmentResponse {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectCredit: number;
  termId: string;
  termCode: string;
  termName: string;
  termStartDate: string;
  termEndDate: string;
  termIsActive: boolean;
  status: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  termStatus: "ACTIVE" | "UPCOMING" | "PAST";
  classCount: number;
  studentCount: number;
  fileCount: number;
  quizCount: number;
  flashcardCount: number;
  summaryCount: number;
  videoCount: number;
  notebookId: string | null;
  notebookTitle: string | null;
  notebookDescription: string | null;
  notebookThumbnailUrl: string | null;
  notebookCreatedAt: string | null;
  notebookUpdatedAt: string | null;
  note: string | null;
  createdBy: string;
  createdAt: string;
  recentClasses: {
    id: string;
    classCode: string;
    room: string;
    dayOfWeek: number;
    periods: string;
    studentCount: number;
    isActive: boolean;
  }[];
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
