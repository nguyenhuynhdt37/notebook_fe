import {
  SourceChunk,
  RagQueryResponse,
  ChatMessage,
  ChatResponse,
} from "@/types/user/chatbot";
import { NotebookFileResponse } from "@/types/admin/notebook-file";

function normalizeSourceChunks(
  sourceChunks: SourceChunk | SourceChunk[] | null
): SourceChunk[] {
  if (!sourceChunks) return [];
  if (Array.isArray(sourceChunks)) return sourceChunks;
  return [sourceChunks];
}

function mapSourceChunksToNotebookFiles(
  sourceChunks: SourceChunk[]
): NotebookFileResponse[] {
  const fileMap = new Map<string, NotebookFileResponse>();

  sourceChunks.forEach((chunk) => {
    if (!chunk.file_id) return;

    if (!fileMap.has(chunk.file_id)) {
      fileMap.set(chunk.file_id, {
        id: chunk.file_id,
        originalFilename: chunk.file_name || "Unknown",
        mimeType: chunk.file_type || "application/octet-stream",
        fileSize: 0,
        storageUrl: "",
        status: "done",
        pagesCount: null,
        ocrDone: true,
        embeddingDone: true,
        chunkSize: 1000,
        chunkOverlap: 200,
        chunksCount: 0,
        uploadedBy: {
          id: "",
          fullName: "",
          email: "",
          avatarUrl: null,
        },
        notebook: {
          id: "",
          title: "",
          description: "",
          type: "personal",
          visibility: "private",
          thumbnailUrl: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return Array.from(fileMap.values());
}

export function mapRagQueryToChatMessage(
  ragQuery: RagQueryResponse
): ChatMessage {
  const sourceChunks = normalizeSourceChunks(ragQuery.sourceChunks);
  const sources = mapSourceChunksToNotebookFiles(sourceChunks);

  return {
    id: ragQuery.id,
    role: "assistant",
    content: ragQuery.answer,
    createdAt: ragQuery.createdAt,
    sources: sources.length > 0 ? sources : undefined,
  };
}

export function mapRagQueriesToChatMessages(
  ragQueries: RagQueryResponse[]
): ChatMessage[] {
  const chatMessages: ChatMessage[] = [];

  ragQueries.forEach((ragQuery) => {
    chatMessages.push({
      id: `${ragQuery.id}-user`,
      role: "user",
      content: ragQuery.question,
      createdAt: ragQuery.createdAt,
    });

    chatMessages.push(mapRagQueryToChatMessage(ragQuery));
  });

  return chatMessages;
}

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatConversationTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Map ChatResponse to ChatMessage
export function mapChatResponseToChatMessage(
  chatResponse: ChatResponse
): ChatMessage {
  const ragSources = chatResponse.sources
    .filter((s) => s.sourceType === "RAG" && s.fileId)
    .map((s) => ({
      id: s.fileId!,
      originalFilename: s.fileId!,
      mimeType: "application/octet-stream",
      fileSize: 0,
      storageUrl: "",
      status: "done" as const,
      pagesCount: null,
      ocrDone: true,
      embeddingDone: true,
      chunkSize: 1000,
      chunkOverlap: 200,
      chunksCount: 0,
      uploadedBy: {
        id: "",
        fullName: "",
        email: "",
        avatarUrl: null,
      },
      notebook: {
        id: "",
        title: "",
        description: "",
        type: "personal" as const,
        visibility: "private" as const,
        thumbnailUrl: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

  return {
    id: chatResponse.id,
    role: chatResponse.role,
    content: chatResponse.content,
    createdAt: chatResponse.createdAt,
    sources: ragSources.length > 0 ? ragSources : undefined,
    sourceDetails:
      chatResponse.sources.length > 0 ? chatResponse.sources : undefined,
    mode: chatResponse.mode,
    model: chatResponse.model,
    files:
      chatResponse.files && chatResponse.files.length > 0
        ? chatResponse.files
        : undefined,
  };
}

export function mapChatResponsesToChatMessages(
  chatResponses: ChatResponse[]
): ChatMessage[] {
  return chatResponses.map(mapChatResponseToChatMessage);
}
