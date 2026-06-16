// API Response Types
// Standardized response wrappers for all API endpoints

/** Standard success response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Paginated list response */
export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Standard error response */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/** Pagination query parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Parsed pagination with computed skip offset */
export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/** Health check response */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  version: string;
}
