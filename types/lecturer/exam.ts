// Exam Types for Lecturer
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "CANCELLED";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "ESSAY";

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
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  difficulty: DifficultyLevel;
  explanation?: string;
}

export interface ExamDetailResponse extends ExamResponse {
  questions?: Question[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface NotebookFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}