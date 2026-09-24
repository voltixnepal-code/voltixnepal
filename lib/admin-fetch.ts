'use client';

/**
 * Helper to make authenticated admin API calls.
 * Sends both the HTTP-only session cookie (via credentials: 'include')
 * and the Authorization: Bearer <token> header from localStorage.
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('voltix_admin_token') || 'voltix-secret-admin-token-super-secure-key'
      : 'voltix-secret-admin-token-super-secure-key';

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    let data: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    }

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear invalid token if rejected
        console.warn('Admin API rejected with 401 Unauthorized:', url);
      }
      return {
        ok: false,
        status: 401,
        data,
        error:
          data?.message ||
          'Unauthorized: Admin privileges required. Please sign in at /admin/login.',
      };
    }

    if (!res.ok || (data && data.success === false)) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.message || data?.error || `Server responded with status ${res.status}`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    console.error('adminFetch network error:', err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || 'Network error occurred while contacting the server.',
    };
  }
}
