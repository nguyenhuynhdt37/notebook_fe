// Regulation Chat Types

export interface NotebookInfo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  totalFiles: number;
}

export interface RegulationFile {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  pagesCount: number | null;
  uploadedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationFilesResponse {
  items: RegulationFile[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
  images?: UploadedImage[];
  isTyping?: boolean;
}

// Uploaded Image type
export interface UploadedImage {
  id: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  ocrText?: string;
}

// API Message types
export interface MessageFile {
  id: string;
  fileType: string;
  fileUrl: string;
  mimeType: string;
  fileName: string;
  ocrText?: string;
}

// Source (nguồn trích dẫn) - theo API spec mới
export interface MessageSource {
  sourceType: "RAG" | "WEB";

  // RAG fields
  fileId?: string;
  fileName?: string;
  chunkIndex?: number;
  content?: string; // Nội dung chunk trích dẫn
  similarity?: number;
  distance?: number;

  // WEB fields
  webIndex?: number;
  url?: string;
  title?: string;
  snippet?: string;

  // Common
  score?: number;
  provider?: string;
}

export interface MessageModel {
  id: string;
  code: string;
  provider: string;
}

export interface RegulationMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  mode?: "RAG" | "WEB" | "HYBRID" | "LLM_ONLY";
  createdAt: string;
  files: MessageFile[];
  sources: MessageSource[];
  model?: MessageModel;
}

export interface RegulationMessagesResponse {
  items: RegulationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Conversation types - theo API spec mới
export interface RegulationConversation {
  id: string;
  title: string | null;
  notebookId: string;
  createdAt: string;
  updatedAt: string | null;
  firstMessage: string | null;
  totalMessages: number;
}

export interface RegulationConversationsResponse {
  items: RegulationConversation[];
  nextCursor: string | null;
  hasMore: boolean;
}
