import { PagedResponse } from "./community";

export interface PersonalNotebookResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  visibility: string;
  thumbnailUrl: string | null;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

// Alias cho response khi tạo notebook (POST /user/notebooks)
export type NotebookResponse = PersonalNotebookResponse;

export type PersonalNotebooksResponse = PagedResponse<PersonalNotebookResponse>;
