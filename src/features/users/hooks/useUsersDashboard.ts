import { useState, useMemo, useCallback } from 'react';
import { useUsersQuery } from '@/features/users/hooks/useUsersQuery';
import { useUserMutation } from '@/features/users/hooks/useUserMutation';
import { filterUsers, sortUsers } from '@/features/users/utils/userUtils';
import type { UserFilters, SortKey } from '@/features/users/types';

export function useUsersDashboard() {
  const { data: users = [], isLoading, isError, refetch } = useUsersQuery();
  const updateUserMutation = useUserMutation();

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    status: 'all',
    sortKey: 'name',
    sortDirection: 'asc'
  });

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setStatus = useCallback((value: UserFilters['status']) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSort = useCallback((key: SortKey) => {
    setFilters(prev => {
      if (prev.sortKey === key) {
        return { ...prev, sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' };
      }
      return { ...prev, sortKey: key, sortDirection: 'asc' };
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const actions = useMemo(() => ({
    setSearch,
    setStatus,
    setSort,
    setPage,
    setPageSize
  }), [setSearch, setStatus, setSort, setPage, setPageSize]);

  const sortedFilteredUsers = useMemo(() => {
    let result = filterUsers(users, filters.search, filters.status);
    return sortUsers(result, filters.sortKey, filters.sortDirection);
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return sortedFilteredUsers.slice(start, start + pagination.pageSize);
  }, [sortedFilteredUsers, pagination]);

  return {
    users: paginatedUsers,
    totalCount: sortedFilteredUsers.length,
    isLoading,
    isError,
    refetch,
    filters,
    pagination,
    actions,
    mutation: updateUserMutation
  };
}
