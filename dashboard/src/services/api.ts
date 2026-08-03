// REST API client wrapper for Visual AI Agent Backend

// Resolve server host (fall back to localhost:5000 if not specified)
const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    // If the dashboard runs on some domain, resolve backend on port 5000 of same host
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBackendUrl();

export const getToken = (): string | null => localStorage.getItem('jwt_token');
export const setToken = (token: string) => localStorage.setItem('jwt_token', token);
export const removeToken = () => localStorage.removeItem('jwt_token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),

  // Sessions
  getSessions: (page = 1, limit = 10) => request<any>(`/sessions?page=${page}&limit=${limit}`),
  startSession: () => request<any>('/sessions/start', { method: 'POST' }),
  endSession: (sessionId: string) => request<any>('/sessions/end', { method: 'POST', body: JSON.stringify({ sessionId }) }),

  // Activities & Timelines
  getActivities: (params: { page?: number; limit?: number; sessionId?: string; q?: string; startDate?: string; endDate?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sessionId) query.append('sessionId', params.sessionId);
    if (params.q) query.append('q', params.q);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    return request<any>(`/activities?${query.toString()}`);
  },
  getTimeline: (sessionId: string) => request<any>(`/activities/timeline?sessionId=${sessionId}`),

  // Screenshots
  getScreenshotUrl: (screenshotId: string) => {
    return `${API_BASE_URL}/api/screenshots/${screenshotId}`;
  },

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (body: any) => request<any>('/settings', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard Stats
  getDashboardStats: () => request<any>('/dashboard/stats'),
};
