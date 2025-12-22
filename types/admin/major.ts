// ============================================================
// Major Types - Quản lý Ngành học
// ============================================================

// === RESPONSE ===

export interface OrgUnitInfo {
  id: string;
  code: string;
  name: string;
  type: string | null;
}

export interface MajorResponse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orgUnit: OrgUnitInfo | null;
  subjectCount: number;
  studentCount: number;
}

export interface SubjectInMajorInfo {
  id: string;
  code: string;
  name: string;
  credit: number | null;
  termNo: number | null;
  isRequired: boolean;
  knowledgeBlock: string | null;
}

export interface MajorDetailResponse extends MajorResponse {
  subjects: SubjectInMajorInfo[];
}

// === REQUEST ===

export interface CreateMajorRequest {
  code: string;
  name: string;
  orgUnitId?: string;
  isActive?: boolean;
}

export interface UpdateMajorRequest {
  code?: string;
  name?: string;
  orgUnitId?: string;
  isActive?: boolean;
}

// === PAGED RESPONSE ===

export interface MajorPagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface MajorPagedResponse {
  items: MajorResponse[];
  meta: MajorPagedMeta;
}
