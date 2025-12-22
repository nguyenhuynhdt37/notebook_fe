// ============================================================
// Term Types - Quản lý Học kỳ
// ============================================================

// === RESPONSE ===

export interface TermResponse {
  id: string;
  code: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  totalAssignments: number;
}

export interface SubjectInTermInfo {
  id: string;
  code: string;
  name: string;
  credit: number | null;
  teacherCount: number;
}

export interface TermDetailResponse extends TermResponse {
  subjects: SubjectInTermInfo[];
}

// === REQUEST ===

export interface CreateTermRequest {
  code: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateTermRequest {
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// === PAGED RESPONSE ===

export interface TermPagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface TermPagedResponse {
  items: TermResponse[];
  meta: TermPagedMeta;
}
