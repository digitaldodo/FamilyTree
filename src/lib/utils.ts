// Utility Functions
// Shared helpers for API responses, pagination, and class merging

import { clsx, type ClassValue } from 'clsx';
import { NextResponse } from 'next/server';
import type { ApiResponse, ApiListResponse, ApiError } from '@/types/api';

/** Merge class names conditionally */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a date to a localized string */
export function formatDate(date: string | Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/** Format date for display (short variant) */
export function formatDateShort(
  date: string | Date,
  locale = 'en-IN',
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/** Generate initials from a name */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

/** Create a typed JSON success response */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { data, message: message ?? 'Success' },
    { status },
  );
}

/** Create a paginated list response */
export function listResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): NextResponse<ApiListResponse<T>> {
  return NextResponse.json({ data, total, page, limit });
}

/** Create a typed JSON error response */
export function errorResponse(
  error: string,
  message: string,
  statusCode: number,
): NextResponse<ApiError> {
  return NextResponse.json({ error, message, statusCode }, { status: statusCode });
}

/** Parse pagination params from URL search params */
export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)),
  );
  const skip = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (
    searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  ) as 'asc' | 'desc';
  return { page, limit, skip, sortBy, sortOrder };
}
