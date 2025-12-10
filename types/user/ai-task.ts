export type AiTaskType =
  | "quiz"
  | "summary"
  | "flashcards"
  | "tts"
  | "video"
  | "other";

export type AiTaskStatus = "queued" | "processing" | "done" | "failed";

export interface AiTaskResponse {
  id: string;
  notebookId: string;
  userId: string;
  userFullName: string;
  userAvatar: string;
  taskType: AiTaskType;
  status: AiTaskStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  isOwner: boolean;
}

export interface GenerateQuizResponse {
  taskId: string;
  status: "queued";
  message: string;
  success: boolean;
}
