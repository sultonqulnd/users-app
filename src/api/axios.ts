import axios, { type AxiosAdapter, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getCachedUsers, updateCachedUser } from '../utils/generateUsers';
import type { UpdateUserPayload, User } from '../types/user.types';

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

  if (m === 'get' && u === '/api/users') {
    const users = getCachedUsers();
    const response: AxiosResponse<User[]> = {
      data: users,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
    return delay(response);
  }

  if (m === 'patch' && u.startsWith('/api/users/')) {
    if (shouldFail(0.3)) {
      const errorResponse: AxiosResponse = {
        data: { message: 'Random server error' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config
      };
      return delay(Promise.reject(errorResponse));
    }

    const id = u.split('/').pop() as string;
    const payload: UpdateUserPayload = typeof data === 'string' ? JSON.parse(data) : data;

    const updated = updateCachedUser({ id, name: payload.name, age: payload.age });

    if (!updated) {
      const notFound: AxiosResponse = {
        data: { message: 'User not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config
      };
      return delay(Promise.reject(notFound));
    }

    const response: AxiosResponse<User> = {
      data: updated,
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    };
    return delay(response);
  }

  const unsupported: AxiosResponse = {
    data: { message: `Unsupported route: ${m.toUpperCase()} ${u}` },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config
  };
  return delay(Promise.reject(unsupported));
};

export const apiClient = axios.create({
  baseURL: '/',
  adapter: mockAdapter
});

