export interface UploaderInfo {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface NotebookInfo {
  id: string;
  title: string;
  description: string | null;
  type: "community" | "private_group" | "personal";
  visibility: "public" | "private";
  thumbnailUrl: string | null;
}

export interface NotebookFileResponse {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  status: string;
  pagesCount: number;
  ocrDone: boolean;
  embeddingDone: boolean;
  chunkSize: number;
  chunkOverlap: number;
  chunksCount: number;
  uploadedBy: UploaderInfo;
  notebook: NotebookInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ContributorInfo {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  filesCount: number;
}

export interface PagedMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
