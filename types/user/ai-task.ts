export type AiSetType =
  | "quiz"
  | "flashcard"
  | "tts"
  | "video"
  | "mindmap"
  | "discuss"
  | "summary"
  | "study-guide"
  | "faq"
  | "key-concepts"
  | "timeline"
  | "translate"
  | "eli5"
  | "socratic"
  | "critic"
  | "deep-dive";

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
    mindmapId?: string;
  };
}

export interface GenerateQuizResponse {
  aiSetId: string;
  status: string;
  message: string;
  success: boolean;
}

export interface AiSuggestionResponse {
  aiSetId: string;
  suggestions: string[];
}

export interface GenerateMindmapResponse {
  aiSetId: string;
  status: string;
  message: string;
  success: boolean;
}

export interface GenerateSuggestionResponse {
  aiSetId: string;
  status: string;
  message: string;
  success: boolean;
}

export type VideoLength = "short" | "medium" | "long";

export interface GenerateVideoResponse {
  aiSetId: string;
  status: string;
  message: string;
  success: boolean;
}

export interface VideoDetailResponse {
  id: string;
  aiSetId: string;
  videoUrl: string;
  title: string;
  style: string;
  durationSeconds: number;
  createdAt: string;
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
