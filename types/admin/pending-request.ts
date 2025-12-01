export interface PendingRequestResponse {
  id: string;
  notebookId: string;
  notebookTitle: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "approved" | "rejected" | "blocked";
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface GetPendingRequestsParams {
  notebookId?: string;
  status?: "pending" | "approved" | "rejected" | "blocked";
  q?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}
