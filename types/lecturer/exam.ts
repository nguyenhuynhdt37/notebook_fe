// Exam Types for Lecturer
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "CANCELLED";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "ESSAY" | "CODING" | "FILL_BLANK" | "MATCHING";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD" | "MIXED";

export interface CreateExamRequest {
  classId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
}

export interface GenerateQuestionsRequest {
  notebookFileIds: string[];
  numberOfQuestions: number;
  questionTypes: string; // "MCQ,TRUE_FALSE,ESSAY"
  difficultyLevel: DifficultyLevel;
  mcqOptionsCount: number;
  includeExplanation?: boolean;
  generateImages?: boolean;
  aiModel?: string;
  language?: string;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
}

export interface ExamResponse {
  id: string;
  title: string;
  description: string;
  status: ExamStatus;
  totalQuestions: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  classId: string;
  className?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  difficultyLevel: DifficultyLevel;
  explanation?: string;
  options?: {
    id: string;
    optionText: string;
    orderIndex: number;
    isCorrect: boolean;
  }[];
}

export interface ExamDetailResponse extends ExamResponse {
  questions?: Question[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface NotebookFile {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: string;
  ocrDone: boolean;
  embeddingDone: boolean;
  createdAt: string;
  notebookId: string;
  notebookTitle: string;
  notebookType: string;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  chunksCount?: number;
  contentPreview?: string;
}

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  type: string;
  totalFiles: number;
  readyFiles: number;
  classId?: string;
  className?: string;
  subjectCode?: string;
  subjectName?: string;
}

export interface UploadFilesRequest {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface FileDetailResponse extends NotebookFile {
  contentSummary?: string;
  totalChunks?: number;
  firstChunkContent?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}