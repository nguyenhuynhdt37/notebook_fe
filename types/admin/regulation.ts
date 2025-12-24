export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegulationNotebookResponse {
  id: string;
  title: string;
  description: string;
  type: string;
  visibility: "public" | "private";
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string | null;
  // Statistics
  totalFiles: number;
  pendingFiles: number;
  approvedFiles: number;
  processingFiles: number;
  failedFiles: number;
  ocrDoneFiles: number;
  embeddingDoneFiles: number;
}

export interface UpdateRegulationNotebookRequest {
  title: string;
  description?: string;
}

export interface RegulationFileResponse {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: "pending" | "approved" | "processing" | "failed";
  ocrDone: boolean;
  embeddingDone: boolean;
  chunkSize: number;
  chunkOverlap: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetRegulationFilesRequest {
  page?: number;
  size?: number;
  sortBy?: "originalFilename" | "fileSize" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  status?: "pending" | "approved" | "processing" | "failed";
  search?: string;
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

export interface UploadRegulationFilesRequest {
  files: File[];
  chunkSize?: number;
  chunkOverlap?: number;
}
