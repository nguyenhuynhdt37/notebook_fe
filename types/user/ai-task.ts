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

export interface SuggestionItem {
  question: string;
  hint: string;
  category: string;
}

export interface AiSuggestionResponse {
  aiSetId: string;
  suggestions: SuggestionItem[];
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

export interface GenerateSummaryResponse {
  id: string;
  status: string;
  type: string;
  createdAt: string;
}

export interface SummaryDetailResponse {
  id: string;
  title: string;
  contentMd: string;
  scriptTts: string | null;
  language: string;
  hasAudio: boolean;
  audioUrl: string | null;
  audioDurationMs: number | null;
  audioFormat: string | null;
  ttsProvider: string | null;
  ttsModel: string | null;
  voiceId: string | null;
  voiceLabel: string | null;
  voiceSpeed: number | null;
  voicePitch: number | null;
  createdAt: string;
  createdBy: string;
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

// WebSocket Message Types
export type AiTaskProgressStep =
  | "queued"
  | "processing"
  | "summarizing"
  | "generating"
  | "saving"
  | "completed"
  | "error";

export interface AiTaskProgressMessage {
  aiSetId: string;
  type: "progress" | "done" | "failed";
  step: AiTaskProgressStep;
  progress: number;
  message: string;
  setType?: AiSetType;
  data?: Record<string, any>;
}

export interface AiTaskNotification {
  aiSetId: string;
  notebookId: string;
  type: "created" | "done" | "deleted";
  setType: AiSetType;
  title: string;
  status: AiSetStatus;
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  timestamp: string;
}

// Timeline Types
export interface GenerateTimelineResponse {
  aiSetId: string;
  status: string;
  success: boolean;
  message: string;
}

export interface TimelineEvent {
  id: string;
  order: number;
  date: string;
  datePrecision: "year" | "month" | "day" | "unknown";
  title: string;
  description: string;
  importance: "minor" | "normal" | "major" | "critical";
  icon?: string;
}

export interface TimelineResponse {
  aiSetId: string;
  title: string;
  mode: string;
  totalEvents: number;
  status: "queued" | "processing" | "done" | "failed";
  createdAt: string;
  events: TimelineEvent[];
  createdBy: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

// Quiz Attempt Types
export interface SubmitAttemptRequest {
  startedAt?: string;
  finishedAt?: string;
  timeSpentSeconds?: number;
  answers: AnswerItem[];
}

export interface AnswerItem {
  quizId: string;
  selectedOptionId: string;
}

export interface AttemptResponse {
  id: string;
  aiSetId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds?: number;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  hasAnalysis: boolean;
  answers?: AttemptAnswerDetail[];
}

export interface AttemptAnswerDetail {
  quizId: string;
  question: string;
  selectedOptionId?: string;
  selectedOptionText?: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface QuizAnalysisResponse {
  scoreText: string;
  summary: string;
  strengths: TopicAnalysis[];
  weaknesses: TopicAnalysis[];
  improvements: TopicAnalysis[];
  recommendations: string[];
}

export interface TopicAnalysis {
  topic: string;
  analysis: string;
  suggestions: string[];
}

// Code Exercise Types
export interface CodeLanguage {
  id: string;
  name: string;
  version: string;
}

export interface CodeFile {
  filename: string;
  content: string;
  role: "starter" | "solution" | "user";
  isMain: boolean;
}

export interface CodeExerciseTestcase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodeExercise {
  id: string;
  title: string;
  description: string;
  language: CodeLanguage;
  files: CodeFile[];
  testcases: CodeExerciseTestcase[];
  status?: "passed" | "failed" | "unattempted";
}

export interface GenerateExerciseRequest {
  fileIds: string[];
  prompt?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  count: number;
}

export interface RunCodeRequest {
  files: {
    filename: string;
    content: string;
    isMain: boolean;
  }[];
}

export interface RunCodeResult {
  status: "passed" | "failed" | "runtime_error";
  passed: number;
  total: number;
  details: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    isHidden: boolean;
    error?: string;
  }[];
}

export interface ExerciseSolution {
  filename: string;
  content: string;
  role: "solution";
}
