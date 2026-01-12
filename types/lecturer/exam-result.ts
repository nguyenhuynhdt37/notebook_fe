// Types cho kết quả thi - dùng cho giảng viên xem và export

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "GRADED";

export interface ExamResultResponse {
    attemptId: string;
    examId: string;
    examTitle: string;
    attemptNumber: number;
    status: AttemptStatus;
    startedAt: string;
    submittedAt: string | null;
    timeSpentSeconds: number;
    timeSpentFormatted: string;
    totalScore: number;
    totalPossibleScore: number;
    percentageScore: number;
    isPassed: boolean;
    grade: string;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    studentId: string;
    studentCode: string;
    studentName: string;
}

export type ExportFormat = "EXCEL" | "CSV";

export interface ExportRequest {
    format: ExportFormat;
    classId?: string;
    includeStudentInfo?: boolean;
    includeScores?: boolean;
    includeTimings?: boolean;
    includeAntiCheatEvents?: boolean;
    includeDetailedAnswers?: boolean;
}

export interface PagedExamResults {
    content: ExamResultResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}
