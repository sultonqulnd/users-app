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
import { filterUsers, sortUsers } from '../utils/userUtils';

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
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<User[]>(QUERY_KEY, (old) => {
        if (!old) return [];
        return old.map((user) =>
          user.id === variables.id ? { ...user, name: variables.name, age: variables.age } : user
        );
      });

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (_error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(QUERY_KEY, context.previousUsers);
      }
      message.error('Update failed. Changes have been rolled back.');
    },
    onSuccess: (data) => {
      // Update the cache with the actual server response to ensure consistency
      // This avoids a heavy refetch of the entire 10,000 user list
      queryClient.setQueryData<User[]>(QUERY_KEY, (old) => {
        if (!old) return [];
        return old.map((user) => (user.id === data.id ? data : user));
      });
      message.success('User updated successfully.');
    }
    // No onSettled/invalidateQueries to prevent refetching 10k items
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

    // 1. Filter
    // Note: filterUsers handles combining search and status logic efficiently
    let result = filterUsers(data, filters.search, filters.status);

    // 2. Sort
    // Note: sortUsers returns a new array copy, preserving immutability
    const sorted = sortUsers(result, filters.sortKey, filters.sortDirection);

    return sorted;
  }, [query.data, filters.search, filters.status, filters.sortKey, filters.sortDirection]);

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

