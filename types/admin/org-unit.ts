export type OrgUnitType =
  | "UNIVERSITY"
  | "SCHOOL"
  | "INSTITUTE"
  | "FACULTY"
  | "DEPARTMENT"
  | "CENTER"
  | "OFFICE";

export interface OrgUnitParent {
  id: string;
  code: string;
  name: string;
}

export interface OrgUnitResponse {
  id: string;
  code: string;
  name: string;
  type: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent: OrgUnitParent | null;
}

export interface OrgUnitRequest {
  code: string;
  name: string;
  type?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export interface OrgUnitPagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface OrgUnitPagedResponse {
  items: OrgUnitResponse[];
  meta: OrgUnitPagedMeta;
}

export const ORG_UNIT_TYPE_LABELS: Record<string, string> = {
  UNIVERSITY: "Đại học",
  SCHOOL: "Trường",
  INSTITUTE: "Viện",
  FACULTY: "Khoa",
  DEPARTMENT: "Bộ môn",
  CENTER: "Trung tâm",
  OFFICE: "Văn phòng",
};
