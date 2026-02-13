import React, { useCallback, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input, Select, Spin, Alert, Button } from 'antd';
import { useUsers } from '../../hooks/useUsers';
import type { User } from '../../types/user.types';
import { UserRow } from './UserRow';
import { UserDetailsModal } from './UserDetailsModal';

const TABLE_HEIGHT = 600; // Fixed height container for virtualization
const ROW_HEIGHT = 56;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export const UsersTable: React.FC = () => {
  const { query, filters, setSearch, setStatus, setSort, sortedFilteredUsers, updateUserMutation } =
    useUsers();

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  React.useEffect(() => {
    // Only update filters when debounced value changes to avoid re-sorting on every keypress.
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

  const users = sortedFilteredUsers;

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const headerSortIndicators = useMemo(
    () => ({
      name: filters.sortKey === 'name' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : '',
      email: filters.sortKey === 'email' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : '',
      age: filters.sortKey === 'age' ? (filters.sortDirection === 'asc' ? '↑' : '↓') : ''
    }),
    [filters.sortKey, filters.sortDirection]
  );

  const showEmptyState = !query.isLoading && !query.isError && users.length === 0;

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

      {query.isLoading && (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      )}

      {query.isError && (
        <div className="space-y-2">
          <Alert
            type="error"
            message="Failed to load users"
            description="The simulated API encountered an error. Please try again."
            showIcon
          />
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      )}

      {showEmptyState && (
        <div className="flex items-center justify-center h-64">
          <span className="text-slate-500">No users match your criteria.</span>
        </div>
      )}

      {!query.isLoading && !query.isError && users.length > 0 && (
        <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm">
          <div className="grid grid-cols-[2fr,2fr,1fr,1fr,1fr] px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50">
            <span>Name</span>
            <span>Email</span>
            <span className="text-center">Age</span>
            <span className="text-center">Status</span>
            <span className="text-center">Score</span>
          </div>
          <div
            ref={parentRef}
            className="relative"
            style={{ height: TABLE_HEIGHT, overflow: 'auto' }}
          >
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                width: '100%',
                position: 'relative'
              }}
            >
              {virtualItems.map((virtualRow) => {
                const user = users[virtualRow.index];
                const top = virtualRow.start;
                const height = virtualRow.size;

                return (
                  <UserRow
                    key={user.id}
                    user={user}
                    onClick={handleRowClick}
                    top={top}
                    height={height}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <UserDetailsModal
        user={selectedUser}
        open={isModalOpen}
        onClose={handleModalClose}
        updateUserMutation={updateUserMutation}
      />
    </div>
  );
};

