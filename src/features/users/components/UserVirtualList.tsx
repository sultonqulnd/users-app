import React, { memo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Skeleton, Result, Button } from 'antd';
import { UserRow } from '@/features/users/components/UserRow';
import { GRID_LAYOUT_CLASS, ROW_HEIGHT } from '@/features/users/constants';
import type { User } from '@/features/users/types';

export interface UserVirtualListProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onRowClick: (user: User) => void;
}

const UserListSkeleton = () => (
  <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm flex-1 min-h-0 overflow-hidden">
    <div className={`grid ${GRID_LAYOUT_CLASS} px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50 flex-none`}>
      <span>Name</span>
      <span>Email</span>
      <span className="text-center">Age</span>
      <span className="text-center">Status</span>
      <span className="text-center">Score</span>
    </div>
    <div className="flex-1 overflow-hidden p-0 relative">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="flex px-3 items-center border-b border-slate-100" style={{ height: ROW_HEIGHT }}>
          <div className="flex-1 pr-4"><Skeleton.Input active size="small" style={{ width: '80%' }} /></div>
          <div className="flex-1 pr-4"><Skeleton.Input active size="small" style={{ width: '60%' }} /></div>
          <div className="w-[10%] flex justify-center"><Skeleton.Input active size="small" style={{ width: 30 }} /></div>
          <div className="w-[10%] flex justify-center"><Skeleton.Input active size="small" style={{ width: 50 }} /></div>
          <div className="w-[10%] flex justify-center"><Skeleton.Input active size="small" style={{ width: 40 }} /></div>
        </div>
      ))}
    </div>
  </div>
);

const UserVirtualListComponent: React.FC<UserVirtualListProps> = ({
  users,
  isLoading,
  isError,
  onRetry,
  onRowClick
}) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const getScrollElement = useCallback(() => parentRef.current, []);
  const estimateSize = useCallback(() => ROW_HEIGHT, []);
  const getItemKey = useCallback((index: number) => users[index]?.id, [users]);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    overscan: 10
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  if (isLoading) {
    return <UserListSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center flex-1 h-full bg-slate-50 rounded-lg">
        <Result
          status="error"
          title="Failed to Load Users"
          subTitle="The server encountered an error while fetching user data."
          extra={[
            <Button type="primary" key="retry" onClick={onRetry}>
              Try Again
            </Button>
          ]}
        />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 h-full bg-slate-50 rounded-lg">
        <Result
          status="404"
          title="No Users Found"
          subTitle="Try adjusting your search or filters to see results."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-slate-200 rounded-lg bg-white shadow-sm flex-1 min-h-0">
      <div className={`grid ${GRID_LAYOUT_CLASS} px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50 flex-none`}>
        <span>Name</span>
        <span>Email</span>
        <span className="text-center">Age</span>
        <span className="text-center">Status</span>
        <span className="text-center">Score</span>
      </div>
      <div
        ref={parentRef}
        className="relative flex-1 overflow-auto min-h-0"
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
                key={virtualRow.key}
                user={user}
                onClick={onRowClick}
                top={top}
                height={height}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const UserVirtualList = memo(UserVirtualListComponent);
