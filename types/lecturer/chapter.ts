export type LessonType = "video" | "quiz" | "code" | "info" | "article";

export interface Lesson {
  id: string;
  title: string;
  lesson_type: LessonType;
  position: number;
  section_id?: string;
}

// New: ChapterItem types for API
export type ChapterItemType =
  | "FILE"
  | "LECTURE"
  | "QUIZ"
  | "VIDEO"
  | "NOTE"
  | "FLASHCARD";

export interface ChapterItemMetadata {
  mimeType?: string;
  fileSize?: number;
  storageUrl?: string;
  originalFilename?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ChapterItem {
  id: string;
  itemType: ChapterItemType;
  refId: string | null;
  title: string;
  sortOrder: number;
  metadata: ChapterItemMetadata;
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items?: ChapterItem[]; // New: API-based items
  lessons?: Lesson[]; // Legacy: for DnD mock
}

export type ChapterListResponse = Chapter[];

export interface CreateChapterRequest {
  title: string;
}

export interface UpdateChapterRequest {
  title: string;
  description?: string;
}

export interface ReorderChaptersRequest {
  orderedIds: string[];
}
