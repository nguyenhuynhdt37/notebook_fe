// Quick Add Student Types

export interface QuickAddStudentRequest {
  classId: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string; // YYYY-MM-DD
}

export interface QuickAddStudentResult {
  success: boolean;
  message: string;
  userCreated: boolean;
  emailSent: boolean;
  addedToNotebook: boolean;
  studentCode: string;
  fullName: string;
  email: string;
}
