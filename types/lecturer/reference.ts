// ============================================================
// Lecturer Reference Types - Dữ liệu tham chiếu cho giảng viên
// ============================================================

// === TERM ===

export interface LecturerTermResponse {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  totalAssignments: number;
}

export interface LecturerTermPagedResponse {
  items: LecturerTermResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// === MAJOR ===

export interface LecturerMajorResponse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  orgUnit: { id: string; code: string; name: string } | null;
  subjectCount: number;
  studentCount: number;
}

export interface LecturerMajorPagedResponse {
  items: LecturerMajorResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// === SUBJECT ===

export interface LecturerSubjectResponse {
  id: string;
  code: string;
  name: string;
  credit: number;
  isActive: boolean;
  majorCount: number;
  assignmentCount: number;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerSubjectPagedResponse {
  items: LecturerSubjectResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// === CLASS ===

export interface LecturerClassResponse {
  id: string;
  classCode: string;
  subjectCode: string;
  subjectName: string;
  termName: string;
  room: string;
  dayOfWeek: number;
  periods: string;
  startDate: string;
  endDate: string;
  note: string | null;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerClassPagedResponse {
  items: LecturerClassResponse[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
