export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
