// ============================================================
// Subject Types - Quản lý Môn học
// ============================================================

// === MAJOR ASSIGNMENT ===

export interface MajorAssignment {
  majorId: string;
  termNo?: number | null;
  isRequired?: boolean;
  knowledgeBlock?: string | null;
}

// === REQUEST ===

export interface CreateSubjectRequest {
  code: string;
  name: string;
  credit?: number | null;
  isActive?: boolean;
  majorAssignments?: MajorAssignment[];
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  credit?: number | null;
  isActive?: boolean;
  majorAssignments?: MajorAssignment[] | null;
}

// === RESPONSE ===

export interface SubjectResponse {
  id: string;
  code: string;
  name: string;
  credit: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  majorCount: number; // Số ngành học có môn này
  assignmentCount: number; // Số đợt phân công giảng dạy
  studentCount: number; // Tổng số sinh viên đã/đang học
}

export interface MajorInSubjectInfo {
  id: string;
  code: string;
  name: string;
  termNo: number | null;
  isRequired: boolean;
  knowledgeBlock: string | null;
}

export interface ClassInfo {
  id: string;
  code: string;
  name: string;
  maxStudents: number;
  note: string | null;
  isActive: boolean;
}

export interface AssignmentInfo {
  id: string;
  termName: string; // Tên học kỳ (VD: "Học kỳ 1 - 2024-2025")
  lecturerName: string; // Tên giảng viên
  lecturerEmail: string; // Email giảng viên (Mới)
  status: string; // Trạng thái đợt dạy (ACTIVE, CLOSED)
  approvalStatus: string; // Trạng thái phê duyệt (APPROVED, PENDING)
  note: string | null; // Ghi chú (Mới)
  classCount: number; // Số lớp mở cho đợt này
  classes: ClassInfo[]; // Danh sách chi tiết lớp học (Mới)
  createdAt: string;
}

export interface SubjectDetailResponse extends SubjectResponse {
  majors: MajorInSubjectInfo[];
  assignments: AssignmentInfo[];
}

// === PAGED RESPONSE ===

export interface SubjectPagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface SubjectPagedResponse {
  items: SubjectResponse[];
  meta: SubjectPagedMeta;
}
