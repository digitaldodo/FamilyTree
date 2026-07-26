export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  );
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (isApiError(error)) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { ...init });
  const contentType = res.headers.get('content-type') || '';

  // Empty responses are considered errors for API endpoints
  if (res.status === 204) {
    return { success: true, data: null };
  }

  let body: any = null;
  try {
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      const text = await res.text();
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = {
          message: res.ok
            ? 'Invalid JSON response from server'
            : `Server returned ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`,
          raw: text,
        };
      }
    }
  } catch (err: any) {
    throw new ApiError(err?.message || 'Failed to parse response', res.status || 0);
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  if (!contentType.includes('application/json') && body?.message === 'Invalid JSON response from server') {
    throw new ApiError(body.message, res.status, body);
  }

  return body;
}
