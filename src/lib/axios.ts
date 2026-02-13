import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getCachedUsers, updateCachedUser } from '@/features/users/utils/generateUsers';
import type { UpdateUserPayload } from '@/features/users/types';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public rawErrors?: unknown;

  constructor(message: string, statusCode: number, rawErrors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.rawErrors = rawErrors;
  }
}

function delay<T>(value: T, min = 500, max = 800): Promise<T> {
  const timeout = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(() => resolve(value), timeout));
}

function shouldFail(probability = 0.3): boolean {
  return Math.random() < probability;
}

const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const { method, url, data } = config;

  const m = (method ?? 'get').toLowerCase();
  const u = url ?? '';

  const success = <T>(body: T): AxiosResponse<T> => ({
    data: body,
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  });

  const error = (status: number, message: string): AxiosResponse => ({
    data: { message, statusCode: status },
    status,
    statusText: status === 404 ? 'Not Found' : 'Error',
    headers: {},
    config
  });

  try {
    if (m === 'get' && u === '/api/users') {
      const users = getCachedUsers();
      return delay(success(users));
    }

    if (m === 'patch' && u.startsWith('/api/users/')) {
      if (shouldFail(0.1)) { 
        return delay(Promise.reject(error(500, 'Random server error simulation')));
      }

      const id = u.split('/').pop() as string;
      const payload: UpdateUserPayload = typeof data === 'string' ? JSON.parse(data) : data;

      const updated = updateCachedUser({ id, name: payload.name, age: payload.age });

      if (!updated) {
        return delay(Promise.reject(error(404, 'User not found')));
      }

      return delay(success(updated));
    }

    return delay(Promise.reject(error(400, `Unsupported route: ${m.toUpperCase()} ${u}`)));
  } catch (_err) {
    return delay(Promise.reject(error(500, 'Internal Mock Adapter Error')));
  }
};

export const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  adapter: mockAdapter
});

apiClient.interceptors.request.use(
  (config) => {
    const token = 'mock-jwt-token-idx'; 
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(new Error(error))
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);
