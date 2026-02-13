import React, { useCallback, useMemo, useState } from 'react';
import { Input, Select, Button, Pagination } from 'antd';
import { useUsers } from '../../hooks/useUsers';
import type { User } from '../../types/user.types';
import { VirtualUserList } from './VirtualUserList';
import { UserDetailsModal } from './UserDetailsModal';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export const UsersTable: React.FC = () => {
  const {
    query,
    filters,
    setSearch,
    setStatus,
    setSort,
    paginatedUsers,
    totalCount,
    page,
    pageSize,
    setPage,
    setPageSize,
    updateUserMutation
  } = useUsers();

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = useCallback((user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    query.refetch();
  }, [query]);

  const handleSortByName = useCallback(() => setSort('name'), [setSort]);
  const handleSortByEmail = useCallback(() => setSort('email'), [setSort]);
  const handleSortByAge = useCallback(() => setSort('age'), [setSort]);

  const headerSortIndicators = useMemo(
    () => ({
      name: filters.sortKey === 'name' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : '',
      email: filters.sortKey === 'email' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : '',
      age: filters.sortKey === 'age' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : ''
    }),
    [filters.sortKey, filters.sortDirection]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-1 min-w-[240px]">
          <Input
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            allowClear
          />
          <Select
            className="w-36"
            value={filters.status}
            onChange={setStatus}
            options={[
              { label: 'All statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSortByName} size="middle">
            Name {headerSortIndicators.name}
          </Button>
          <Button onClick={handleSortByEmail} size="middle">
            Email {headerSortIndicators.email}
          </Button>
          <Button onClick={handleSortByAge} size="middle">
            Age {headerSortIndicators.age}
          </Button>
        </div>
      </div>

      <div className="text-right text-xs text-slate-400 px-1">
        Found {totalCount.toLocaleString()} users
      </div>

      <VirtualUserList
        users={paginatedUsers}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={handleRetry}
        onRowClick={handleRowClick}
      />

      <div className="flex justify-end">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={totalCount}
          onChange={(p, s) => {
            setPage(p);
            setPageSize(s);
          }}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>

      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onClose={handleModalClose}
        updateUserMutation={updateUserMutation}
      />
    </div>
  );
};

