export interface OrgUnitInfo {
  id: string;
  code: string;
  name: string;
  type: string | null;
}

export interface LecturerResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lecturerCode: string | null;
  academicDegree: string | null;
  academicRank: string | null;
  specialization: string | null;
  phone: string | null;
  orgUnit: OrgUnitInfo | null;
}

export interface CreateLecturerRequest {
  email: string;
  fullName: string;
  password: string;
  avatarUrl?: string;
  lecturerCode: string;
  orgUnitId?: string;
  academicDegree?: string;
  academicRank?: string;
  specialization?: string;
  phone?: string;
}

export interface UpdateLecturerRequest {
  email?: string;
  fullName?: string;
  password?: string;
  avatarUrl?: string;
  active?: boolean;
  lecturerCode?: string;
  orgUnitId?: string;
  academicDegree?: string;
  academicRank?: string;
  specialization?: string;
  phone?: string;
}

export interface LecturerPagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface LecturerPagedResponse {
  items: LecturerResponse[];
  meta: LecturerPagedMeta;
}

export const ACADEMIC_DEGREE_LABELS: Record<string, string> = {
  CN: "Cử nhân",
  ThS: "Thạc sĩ",
  TS: "Tiến sĩ",
  "PGS.TS": "PGS. Tiến sĩ",
  "GS.TS": "GS. Tiến sĩ",
};

export const ACADEMIC_RANK_LABELS: Record<string, string> = {
  PGS: "Phó Giáo sư",
  GS: "Giáo sư",
};
