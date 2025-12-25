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

export interface MessageSource {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  chunkIndex: number;
  chunkContent: string;
  similarity: number;
  score?: number;
  sourceType?: string;
  provider?: string;
}

export interface MessageModel {
  id: string;
  code: string;
  provider: string;
}

export interface RegulationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  files: MessageFile[];
  sources: MessageSource[];
  model?: MessageModel;
}

export interface RegulationMessagesResponse {
  items: RegulationMessage[];
  cursorNext: string | null;
  hasMore: boolean;
}

// Conversation types
export interface RegulationConversation {
  id: string;
  title: string | null;
  notebookId: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationConversationsResponse {
  conversations: RegulationConversation[];
  cursorNext: string | null;
  hasMore: boolean;
}
