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
        body = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response from server');
      }
    }
  } catch (err: any) {
    // Re-throw with a clear message
    throw new Error(err?.message || 'Failed to parse response');
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `HTTP ${res.status}`;
    const error: any = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}
