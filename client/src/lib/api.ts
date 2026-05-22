const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach authorization headers if token exists in memory/state (via localstorage backup if needed)
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    // Check for expired token
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const refreshData = await refreshRes.json();
          
          if (refreshData.success && refreshData.data?.accessToken) {
            const newToken = refreshData.data.accessToken;
            if (typeof window !== 'undefined') {
              localStorage.setItem('accessToken', newToken);
            }
            isRefreshing = false;
            onRefreshed(newToken);
          } else {
            // Refresh failed, clear session
            isRefreshing = false;
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              window.dispatchEvent(new Event('auth-logout'));
            }
            throw new Error('Session expired. Please log in again.');
          }
        } catch (refreshErr) {
          isRefreshing = false;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            window.dispatchEvent(new Event('auth-logout'));
          }
          throw refreshErr;
        }
      }

      // Queue request while refreshing
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, config).then((r) => r.json()));
        });
      });
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error('API Fetch Error:', error);
    return {
      success: false,
      message: error.message || 'Network error connection failed.'
    };
  }
};

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, body: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    
  put: <T = any>(endpoint: string, body: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' })
};
