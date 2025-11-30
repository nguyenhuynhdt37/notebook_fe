export interface NotebookAdminResponse {
  id: string;
  title: string;
  description: string | null;
  type: "community" | "private_group" | "personal";
  visibility: "public" | "private";
  thumbnailUrl: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  items: T[];
  meta: PagedMeta;
}

export interface NotebookDetailResponse {
  id: string;
  title: string;
  description: string | null;
  type: "community" | "private_group" | "personal";
  visibility: "public" | "private";
  thumbnailUrl: string | null;
  createdById: string;
  createdByFullName: string;
  createdAt: string;
  updatedAt: string;
  members: MemberInfo;
  files: FileInfo;
}

export interface MemberInfo {
  totalCount: number;
  items: MemberItem[];
}

export interface MemberItem {
  userId: string;
  userFullName: string;
  userEmail: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface FileInfo {
  totalCount: number;
  items: FileItem[];
}

export interface FileItem {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  status: string;
  createdAt: string;
}
