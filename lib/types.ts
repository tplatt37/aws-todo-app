// Todo Item Types
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Not Started' | 'In Progress' | 'Done' | 'Canceled';

export interface TodoItem {
  id: string;
  description: string;
  dueDate: string; // ISO 8601 format
  priority: Priority;
  status: Status;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateTodoInput {
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
}

export interface UpdateTodoInput {
  description?: string;
  dueDate?: string;
  priority?: Priority;
  status?: Status;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

// Export Response Type
export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
  fileName: string;
}

// Sort Types
export type SortField = 'description' | 'dueDate' | 'priority' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Feature Flags Types
export interface FeatureFlags {
  [key: string]: boolean;
}
