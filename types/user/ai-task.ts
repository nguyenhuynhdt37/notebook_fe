export type AiSetType = "quiz" | "flashcard" | "tts" | "video";

export type AiSetStatus = "queued" | "processing" | "done" | "failed";

export interface AiSetResponse {
  id: string;
  notebookId: string;
  userId: string;
  userFullName: string;
  userAvatar: string;
  setType: AiSetType;
  status: AiSetStatus;
  errorMessage: string | null;
  title: string;
  description: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
  fileCount: number;
  owner: boolean;
  outputStats?: {
    audioUrl?: string;
    voiceName?: string;
    quizIds?: string[];
    quizCount?: number;
  };
}

export interface GenerateQuizResponse {
  aiSetId: string;
  status: string;
  message: string;
  success: boolean;
}

// Quiz Detail Types
export interface QuizListResponse {
  aiSetId: string;
  title: string;
  description: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
  createdById: string;
  createdByName: string;
  createdByAvatar: string;
  notebookId: string;
  quizzes: QuizResponse[];
  totalQuizzes: number;
}

export interface QuizResponse {
  id: string;
  question: string;
  explanation: string | null;
  difficultyLevel: number;
  createdAt: string;
  options: QuizOptionResponse[];
}

export interface QuizOptionResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string | null;
  position: number;
}

// Giữ lại aliases để tương thích ngược
export type AiTaskType = AiSetType;
export type AiTaskStatus = AiSetStatus;
export type AiTaskResponse = AiSetResponse;
