import { NotebookFileResponse } from "@/types/admin/notebook-file";

export interface SourceChunk {
  file_id?: string;
  file_name?: string;
  file_type?: string;
  chunk_index?: number;
  metadata?: any;
  score?: number;
  bounding_box?: any;
  ocr_text?: string;
  [key: string]: any;
}

export interface RagQueryResponse {
  id: string;
  question: string;
  answer: string;
  sourceChunks: SourceChunk | SourceChunk[] | null;
  latencyMs: number | null;
  createdAt: string;
}

export interface ChatHistoryResponse {
  messages: RagQueryResponse[];
  cursorNext: string | null;
  hasMore: boolean;
}

export interface SourceResponse {
  sourceType: "RAG" | "WEB";
  fileId?: string | null;
  chunkIndex?: number | null;
  content?: string | null;
  similarity?: number | null;
  distance?: number | null;
  webIndex?: number | null;
  url?: string | null;
  title?: string | null;
  snippet?: string | null;
  imageUrl?: string | null;
  favicon?: string | null;
  score: number;
  provider: string;
}

export interface FileResponse {
  id: string;
  fileType: "image" | "document";
  fileUrl: string;
  mimeType: string;
  fileName: string;
  ocrText?: string | null;
  caption?: string | null;
  metadata?: any | null;
}

export interface ModelResponse {
  id: string;
  code: string;
  provider: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  mode: "RAG" | "WEB" | "HYBRID" | "LLM_ONLY" | "AUTO";
  role: "user" | "assistant";
  context?: any | null;
  createdAt: string;
  metadata?: any | null;
  model?: ModelResponse | null;
  sources: SourceResponse[];
  files: FileResponse[];
}

export interface ListMessagesResponse {
  messages: ChatResponse[];
  cursorNext: string | null;
  hasMore: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: NotebookFileResponse[];
  sourceDetails?: SourceResponse[];
  mode?: "RAG" | "WEB" | "HYBRID" | "LLM_ONLY" | "AUTO";
  model?: ModelResponse | null;
  files?: FileResponse[];
}

export interface ChatConversation {
  id: string;
  title: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string | null;
  firstMessage: string | null;
  totalMessages: number;
}

export interface ChatConversationsResponse {
  conversations: ChatConversation[];
  cursorNext: string | null;
  hasMore: boolean;
}

export interface ConversationDetailResponse {
  id: string;
  title: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string | null;
  firstMessage: string | null;
  totalMessages: number;
}

export interface LlmModel {
  id: string;
  code: string;
  provider: string;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  metadata: {
    max_tokens?: number;
    [key: string]: any;
  } | null;
  createdAt: string;
}
