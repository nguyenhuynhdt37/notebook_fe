export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean | null;
  avatarUrl: string | null;
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

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
}

export interface ValidationErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  errors: {
    [key: string]: string;
  };
}
