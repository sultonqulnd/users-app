import { apiClient } from './axios';
import type { UpdateUserPayload, User } from '../types/user.types';

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
}

export async function patchUser(payload: UpdateUserPayload): Promise<User> {
  const response = await apiClient.patch<User>(`/api/users/${payload.id}`, payload);
  return response.data;
}

