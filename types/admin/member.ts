export interface UserStatistics {
  fileCount: number;
  videoCount: number;
  flashcardCount: number;
  ttsCount: number;
  quizCount: number;
  messageCount: number;
  ragQueryCount: number;
}

export interface MemberResponse {
  id: string;
  notebookId: string;
  notebookTitle: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  role: "admin" | "member" | "owner";
  status: "pending" | "approved" | "rejected" | "blocked";
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statistics: UserStatistics;
}

export interface PagedMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  items: T[];
  meta: PagedMeta;
}

