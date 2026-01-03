// Student Exam Types
export interface AvailableExam {
  id: string;
  title: string;
  className: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalQuestions: number;
  maxAttempts: number;
  remainingAttempts: number;
  canTakeExam: boolean;
  isActive: boolean;
  isTimeUp: boolean;
}

export interface BrowserInfo {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  screenResolution: string;
  timezone: string;
  deviceType: string;
  isFullScreen: boolean;
  academicIntegrityAcknowledged: boolean;
  rulesAcknowledged: boolean;
}

export interface ExamOption {
  optionId: string;
  optionText: string;
  orderIndex: number;
}

export interface ExamQuestion {
  questionId: string;
  questionType: "MCQ" | "TRUE_FALSE" | "ESSAY";
  questionText: string;
  orderIndex: number;
  points: number;
  options?: ExamOption[];
}

export interface StartExamResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  remainingTimeSeconds: number;
  durationMinutes: number;
  questions: ExamQuestion[];
}

export interface StudentAnswer {
  questionId: string;
  answerData: {
    selectedOptionId?: string;
    essayText?: string;
  };
  timeSpentSeconds: number;
  revisionCount: number;
  wasSkipped: boolean;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface SubmitExamRequest {
  attemptId: string;
  isAutoSubmit: boolean;
  timeSpentSeconds: number;
  answers: StudentAnswer[];
  tabSwitchCount: number;
  copyPasteCount: number;
  rightClickCount: number;
}

export interface ExamResult {
  attemptId: string;
  examTitle: string;
  status: "GRADED" | "PENDING";
  totalScore: number;
  totalPossibleScore: number;
  percentageScore: number;
  isPassed: boolean;
  grade: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeSpentFormatted: string;
}