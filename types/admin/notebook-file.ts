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
  pagesCount: number | null;
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

export interface NotebookFileDetailResponse {
  fileInfo: {
    id: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    storageUrl: string;
    status: string;
    pagesCount: number | null;
    ocrDone: boolean;
    embeddingDone: boolean;
    chunkSize: number;
    chunkOverlap: number;
    chunksCount: number;
    uploadedBy: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
    } | null;
    notebook: {
      id: string;
      title: string;
      description: string;
      type: string;
      visibility: string;
      thumbnailUrl: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  };
  totalTextChunks: number;
  generatedContentCounts: {
    video: number;
    podcast: number;
    flashcard: number;
    quiz: number;
  };
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

export interface UserNotebookFileDetailResponse {
  fileInfo: NotebookFileResponse;
  fullContent: string;
  generatedContentCounts: {
    video: number;
    podcast: number;
    flashcard: number;
    quiz: number;
  };
  contributor: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface FileChunkResponse {
  id: string;
  chunkIndex: number;
  content: string;
}
