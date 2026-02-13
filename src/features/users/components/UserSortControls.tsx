import React, { memo } from 'react';
import { Button } from 'antd';
import type { SortKey, SortDirection } from '@/features/users/types';

interface UserSortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

const UserSortControlsComponent: React.FC<UserSortControlsProps> = ({
  sortKey,
  sortDirection,
  onSort
}) => {
  const getIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => onSort('name')}>Name {getIndicator('name')}</Button>
      <Button onClick={() => onSort('email')}>Email {getIndicator('email')}</Button>
      <Button onClick={() => onSort('age')}>Age {getIndicator('age')}</Button>
    </div>
  );
};

export const UserSortControls = memo(UserSortControlsComponent);
