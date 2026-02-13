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
  paginatedUsers: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
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
        if (!old) return [];
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
    onSuccess: (data) => {
      queryClient.setQueryData<User[]>(QUERY_KEY, (old) => {
        if (!old) return [];
        return old.map((user) => (user.id === data.id ? data : user));
      });
      message.success('User updated successfully.');
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery<User[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
  });

  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  }, []);

  const setStatus = useCallback((value: UsersFilters['status']) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(1);
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
    let result = filterUsers(data, filters.search, filters.status);
    const sorted = sortUsers(result, filters.sortKey, filters.sortDirection);
    return sorted;
  }, [query.data, filters.search, filters.status, filters.sortKey, filters.sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedFilteredUsers.slice(start, start + pageSize);
  }, [sortedFilteredUsers, page, pageSize]);

  const updateUserMutation = useUserMutation();

  return {
    query,
    filters,
    setSearch,
    setStatus,
    setSort,
    paginatedUsers,
    totalCount: sortedFilteredUsers.length,
    page,
    pageSize,
    setPage,
    setPageSize,
    updateUserMutation
  };
}

