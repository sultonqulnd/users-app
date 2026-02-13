import { useCallback, useMemo, useState } from 'react';
import { message } from 'antd';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';
import { fetchUsers, patchUser } from '../api/users.api';
import type { UpdateUserPayload, User, UserStatus } from '../types/user.types';

export type SortKey = 'name' | 'email' | 'age';
export type SortDirection = 'asc' | 'desc';

export interface UsersFilters {
  search: string;
  status: UserStatus | 'all';
  sortKey: SortKey;
  sortDirection: SortDirection;
}

export interface UseUsersResult {
  query: UseQueryResult<User[], unknown>;
  filters: UsersFilters;
  setSearch: (value: string) => void;
  setStatus: (value: UsersFilters['status']) => void;
  setSort: (key: SortKey) => void;
  sortedFilteredUsers: User[];
  updateUserMutation: UseMutationResult<User, unknown, UpdateUserPayload, { previousUsers?: User[] }>;
}

export const QUERY_KEY = ['users'];

export function useUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, unknown, UpdateUserPayload, { previousUsers?: User[] }>({
    mutationFn: patchUser,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      const previousUsers = queryClient.getQueryData<User[]>(QUERY_KEY);

      queryClient.setQueryData<User[]>(QUERY_KEY, (old) => {
        if (!old) return old ?? [];
        return old.map((user) =>
          user.id === variables.id ? { ...user, name: variables.name, age: variables.age } : user
        );
      });

      return { previousUsers };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(QUERY_KEY, context.previousUsers);
      }
      message.error('Update failed. Changes have been rolled back.');
    },
    onSuccess: () => {
      message.success('User updated (optimistic update simulated).');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });
}

export function useUsers(): UseUsersResult {
  const [filters, setFilters] = useState<UsersFilters>({
    search: '',
    status: 'all',
    sortKey: 'name',
    sortDirection: 'asc'
  });

  const query = useQuery<User[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10
  });

  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const setStatus = useCallback((value: UsersFilters['status']) => {
    setFilters((prev) => ({ ...prev, status: value }));
  }, []);

  const setSort = useCallback((key: SortKey) => {
    setFilters((prev) => {
      if (prev.sortKey === key) {
        const nextDirection: SortDirection = prev.sortDirection === 'asc' ? 'desc' : 'asc';
        return { ...prev, sortDirection: nextDirection };
      }
      return { ...prev, sortKey: key, sortDirection: 'asc' };
    });
  }, []);

  const sortedFilteredUsers = useMemo(() => {
    const data = query.data ?? [];
    if (!data.length) return data;

    const searchLower = filters.search.trim().toLowerCase();

    // 1. Filter
    let result = data;
    if (searchLower) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter((user) => user.status === filters.status);
    }

    // 2. Sort
    const { sortKey, sortDirection } = filters;
    const direction = sortDirection === 'asc' ? 1 : -1;

    // Use a simpler sort for stability and performance
    // Note: Array.prototype.sort is in-place, so we MUST copy the array.
    const sorted = [...result].sort((a, b) => {
      if (sortKey === 'age') {
        return (a.age - b.age) * direction;
      }

      const aVal = a[sortKey].toLowerCase();
      const bVal = b[sortKey].toLowerCase();

      if (aVal < bVal) return -1 * direction;
      if (aVal > bVal) return 1 * direction;
      return 0;
    });

    return sorted;
  }, [query.data, filters]);

  const updateUserMutation = useUserMutation();

  return {
    query,
    filters,
    setSearch,
    setStatus,
    setSort,
    sortedFilteredUsers,
    updateUserMutation
  };
}

