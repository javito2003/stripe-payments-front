import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FailedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig & { _retry?: boolean };
};

let isRefreshing = false;
let queue: FailedRequest[] = [];

function flushQueue(error: unknown, tokenRefreshed: boolean) {
  const q = queue;
  queue = [];
  for (const req of q) {
    if (tokenRefreshed) req.resolve(true);
    else req.reject(error);
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANT: send cookies (access + refresh)
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // If not an auth error or no config, just throw
    if (!original || status !== 401) throw error;

    // Avoid infinite loops
    if (original._retry) throw error;
    original._retry = true;

    // If refresh already in progress, wait
    if (isRefreshing) {
      await new Promise((resolve, reject) => {
        queue.push({ resolve, reject, config: original });
      });
      return api(original);
    }

    isRefreshing = true;

    try {
      // Backend should read refresh token from httpOnly cookie and set a new access token cookie
      await api.post('/auth/refresh', {});
      flushQueue(null, true);
      return api(original);
    } catch (e) {
      flushQueue(e, false);
      throw error;
    } finally {
      isRefreshing = false;
    }
  }
);
