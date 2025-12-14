// Node trong mindmap
export interface MindmapNode {
  id: string;
  title: string;
  summary: string;
  children: MindmapNode[];
}

// Response từ API GET /mindmap/{aiSetId}
export interface MindmapResponse {
  id: string;
  notebookId: string;
  title: string;
  mindmap: MindmapNode;
  layout: object | null;
  aiSetId: string;
  createdById: string;
  createdByName: string;
  createdByAvatar: string;
  createdAt: string;
  updatedAt: string;
}

// Response từ API POST /generate
export interface GenerateMindmapResponse {
  aiSetId: string;
  status: "queued";
  success: boolean;
  message: string;
}
