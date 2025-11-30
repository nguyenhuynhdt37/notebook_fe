export interface AvailableGroupResponse {
  id: string;
  title: string;
  description: string | null;
  visibility: "public";
  thumbnailUrl: string | null;
  memberCount: number;
  createdAt: string;
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

export type AvailableGroupsResponse = PagedResponse<AvailableGroupResponse>;

export interface CommunityPreviewResponse {
  id: string;
  title: string;
  description: string | null;
  visibility: "public";
  thumbnailUrl: string | null;
  createdById: string | null;
  createdByFullName: string | null;
  createdAt: string;
  updatedAt: string;
  statistics: {
    memberCount: number;
    fileCount: number;
    messageCount: number;
    flashcardCount: number;
    quizCount: number;
  };
  recentMessages: {
    id: string;
    type: "user" | "system" | "ai";
    contentPreview: string | null;
    authorName: string;
    createdAt: string;
  }[];
  recentFiles: {
    id: string;
    originalFilename: string;
    mimeType: string | null;
    fileSize: number | null;
    createdAt: string;
  }[];
}

export interface MembershipStatusResponse {
  notebookId: string;
  isMember: boolean;
  canJoin: boolean;
  requiresApproval: boolean;
  status: "approved" | "pending" | "rejected" | "blocked" | null;
  role: "member" | "owner" | "admin" | null;
  joinedAt: string | null;
  requestedAt: string | null;
}

export interface JoinedGroupResponse {
  id: string;
  title: string;
  description: string | null;
  visibility: "public" | "private";
  thumbnailUrl: string | null;
  memberCount: number;
  membershipStatus: "approved" | "pending" | "rejected" | "blocked";
  role: "member" | "owner" | "admin";
  joinedAt: string | null;
  createdAt: string;
}

export type JoinedGroupsResponse = PagedResponse<JoinedGroupResponse>;
