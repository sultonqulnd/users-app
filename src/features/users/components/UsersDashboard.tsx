import React, { useState, useCallback } from 'react';
import { Pagination } from 'antd';
import { useUsersDashboard } from '@/features/users/hooks/useUsersDashboard';
import { UserVirtualList } from '@/features/users/components/UserVirtualList';
import { UserEditModal } from '@/features/users/components/UserEditModal';
import { UserFiltersBar } from '@/features/users/components/UserFiltersBar';
import { UserSortControls } from '@/features/users/components/UserSortControls';
import type { User } from '@/features/users/types';

export const UsersDashboard: React.FC = () => {
  const {
    users,
    totalCount,
    isLoading,
    isError,
    refetch,
    filters,
    pagination,
    actions,
    mutation
  } = useUsersDashboard();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = useCallback((user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePaginationChange = useCallback((p: number, s: number) => {
    if (s !== pagination.pageSize) {
      actions.setPageSize(s);
    } else {
      actions.setPage(p);
    }
  }, [pagination.pageSize, actions]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <UserFiltersBar 
          initialSearch={filters.search}
          status={filters.status}
          onSearchChange={actions.setSearch}
          onStatusChange={actions.setStatus}
        />
        <UserSortControls 
          sortKey={filters.sortKey}
          sortDirection={filters.sortDirection}
          onSort={actions.setSort}
        />
      </div>

      <div className="text-right text-xs text-slate-400 px-1">
        Found {totalCount.toLocaleString()} users
      </div>

      <UserVirtualList
        users={users}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onRowClick={handleRowClick}
      />

      <div className="flex justify-end">
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={totalCount}
          onChange={handlePaginationChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>

      <UserEditModal
        user={selectedUser}
        open={isModalOpen}
        onClose={handleModalClose}
        mutation={mutation}
      />
    </div>
  );
};
