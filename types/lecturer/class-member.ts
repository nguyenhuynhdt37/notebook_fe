// ============================================================
// Lecturer Class Members Types
// ============================================================

// === ENTITIES ===

export interface ClassStudent {
  id: string;
  studentCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  classCode: string;
  subjectCode?: string;
  subjectName?: string;
  termName?: string;
  hasUserAccount: boolean;
  hasNotebookAccess: boolean;
  createdAt: string;
}

// === RESPONSES ===

export interface ClassMembersResponse {
  items: ClassStudent[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
