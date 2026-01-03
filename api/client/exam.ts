import api from "./axios";
import { 
  CreateExamRequest, 
  ExamResponse, 
  ExamDetailResponse, 
  GenerateQuestionsRequest,
  NotebookFile,
  Notebook,
  PagedResponse,
  UploadFilesRequest,
  FileDetailResponse
} from "@/types/lecturer/exam";
import {
  AvailableExam,
  BrowserInfo,
  StartExamResponse,
  SubmitExamRequest,
  ExamResult
} from "@/types/student/exam";

export const examApi = {
  // Exam CRUD operations
  createExam: async (data: CreateExamRequest): Promise<ExamResponse> => {
    const response = await api.post<ExamResponse>("/api/exams", data);
    return response.data;
  },

  getExam: async (examId: string): Promise<ExamDetailResponse> => {
    const response = await api.get<ExamDetailResponse>(`/api/exams/${examId}`);
    return response.data;
  },

  previewExam: async (examId: string): Promise<ExamDetailResponse> => {
    const response = await api.get<ExamDetailResponse>(`/api/exams/${examId}/preview`);
    return response.data;
  },

  updateExam: async (examId: string, data: Partial<CreateExamRequest>): Promise<ExamResponse> => {
    const response = await api.put<ExamResponse>(`/api/exams/${examId}`, data);
    return response.data;
  },

  deleteExam: async (examId: string): Promise<void> => {
    await api.delete(`/api/exams/${examId}`);
  },

  // Exam status management
  publishExam: async (examId: string): Promise<ExamResponse> => {
    const response = await api.put<ExamResponse>(`/api/exams/${examId}/publish`);
    return response.data;
  },

  activateExam: async (examId: string): Promise<ExamResponse> => {
    const response = await api.put<ExamResponse>(`/api/exams/${examId}/activate`);
    return response.data;
  },

  cancelExam: async (examId: string): Promise<ExamResponse> => {
    const response = await api.put<ExamResponse>(`/api/exams/${examId}/cancel`);
    return response.data;
  },

  // Question generation
  generateQuestions: async (examId: string, data: GenerateQuestionsRequest): Promise<ExamDetailResponse> => {
    try {
      // Increase timeout for AI question generation (5 minutes)
      const response = await api.post<ExamDetailResponse>(`/api/exams/${examId}/generate`, data, {
        timeout: 300000 // 5 minutes
      });
      console.log("Generate questions response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error("Generate questions error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // If it's a 201 Created or other success status, treat as success
      if (error.response?.status >= 200 && error.response?.status < 300) {
        console.log("Treating as success due to 2xx status code");
        return error.response.data;
      }
      
      throw error;
    }
  },

  // NEW: Notebook and file operations according to API guide
  getAccessibleNotebooks: async (): Promise<Notebook[]> => {
    const response = await api.get<Notebook[]>("/lecturer/notebooks/accessible");
    return response.data;
  },

  getNotebookFiles: async (notebookId: string, search?: string): Promise<NotebookFile[]> => {
    const searchParam = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await api.get<NotebookFile[]>(`/lecturer/notebooks/${notebookId}/files${searchParam}`);
    return response.data;
  },

  getAllAccessibleFiles: async (search?: string, notebookId?: string, limit = 100): Promise<NotebookFile[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (notebookId) params.append('notebookId', notebookId);
    params.append('limit', limit.toString());
    
    const response = await api.get<NotebookFile[]>(`/lecturer/notebooks/files?${params.toString()}`);
    return response.data;
  },

  getFileDetail: async (notebookId: string, fileId: string): Promise<FileDetailResponse> => {
    const response = await api.get<FileDetailResponse>(`/lecturer/notebooks/${notebookId}/files/${fileId}`);
    return response.data;
  },

  // Simple upload (recommended)
  uploadFilesSimple: async (notebookId: string, files: File[]): Promise<NotebookFile[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post<NotebookFile[]>(
      `/lecturer/notebooks/${notebookId}/files/simple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Advanced upload (for developers)
  uploadFilesAdvanced: async (
    notebookId: string, 
    files: File[], 
    config: UploadFilesRequest = {}
  ): Promise<NotebookFile[]> => {
    const formData = new FormData();
    
    // Add request config as JSON string
    const requestConfig = {
      chunkSize: config.chunkSize || 3000,
      chunkOverlap: config.chunkOverlap || 250
    };
    formData.append('request', JSON.stringify(requestConfig));
    
    // Add files
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post<NotebookFile[]>(
      `/lecturer/notebooks/${notebookId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteFile: async (notebookId: string, fileId: string): Promise<void> => {
    await api.delete(`/lecturer/notebooks/${notebookId}/files/${fileId}`);
  },

  // Legacy methods for backward compatibility
  getUserNotebooks: async (): Promise<Notebook[]> => {
    // Redirect to new endpoint
    return examApi.getAccessibleNotebooks();
  },

  // Lecturer exam list
  getLecturerExams: async (page = 0, size = 10, sort = "createdAt,desc"): Promise<PagedResponse<ExamResponse>> => {
    const response = await api.get<PagedResponse<ExamResponse>>(
      `/api/exams/lecturer?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getClassExams: async (classId: string, page = 0, size = 10): Promise<PagedResponse<ExamResponse>> => {
    const response = await api.get<PagedResponse<ExamResponse>>(
      `/api/exams/class/${classId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  // Student exam endpoints
  getAvailableExams: async (): Promise<AvailableExam[]> => {
    const response = await api.get<AvailableExam[]>("/api/exams/available");
    return response.data;
  },

  canTakeExam: async (examId: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/api/exams/${examId}/can-take`);
    return response.data;
  },

  startExam: async (examId: string, browserInfo: BrowserInfo): Promise<StartExamResponse> => {
    const response = await api.post<StartExamResponse>(`/api/exams/${examId}/start`, browserInfo);
    return response.data;
  },

  submitExam: async (examId: string, submitData: SubmitExamRequest): Promise<ExamResult> => {
    const response = await api.post<ExamResult>(`/api/exams/${examId}/submit`, submitData);
    return response.data;
  },

  getExamResult: async (examId: string): Promise<ExamResult> => {
    const response = await api.get<ExamResult>(`/api/exams/${examId}/result`);
    return response.data;
  },
};

export default examApi;