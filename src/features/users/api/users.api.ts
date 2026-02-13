import { apiClient } from '@/lib/axios';
import type { UpdateUserPayload, User } from '@/features/users/types';

export async function fetchUsers(): Promise<User[]> {
  return apiClient.get<User[]>('/api/users') as unknown as Promise<User[]>;
}

export async function patchUser(payload: UpdateUserPayload): Promise<User> {
  return apiClient.patch<User>(`/api/users/${payload.id}`, payload) as unknown as Promise<User>;
}
