// ============================================================
// Lecturer Class & Student Types
// ============================================================

// === RESPONSE ===

export interface ClassResponse {
  id: string;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  termName: string | null;
  room: string | null;
  dayOfWeek: number | null; // 2->Mon, 8->Sun
  periods: string | null;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;
  note: string | null;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
}

export interface ClassPagedResponse {
  content: ClassResponse[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ClassStudentResponse {
  id: string; // ClassMember ID
  studentCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  classCode: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  termName: string | null;
  createdAt: string;
}

export interface ClassStudentPagedResponse {
  content: ClassStudentResponse[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// === PARAMS ===

export interface GetClassesParams {
  termId?: string;
  assignmentId?: string;
  q?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface GetClassMembersParams {
  q?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
