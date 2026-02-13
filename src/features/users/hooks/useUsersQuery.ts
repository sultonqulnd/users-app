import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/features/users/api/users.api';
import { USERS_QUERY_KEYS } from '@/features/users/constants';
import type { User } from '@/features/users/types';

export function useUsersQuery() {
  return useQuery<User[]>({
    queryKey: USERS_QUERY_KEYS.all,
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
  });
}
