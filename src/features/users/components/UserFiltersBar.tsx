import React, { useState, useEffect, memo } from 'react';
import { Input, Select } from 'antd';
import { useDebounce } from '@/hooks/useDebounce';
import { USER_STATUS_LABELS } from '../constants';
import type { UserStatus } from '../types';

interface UserFiltersBarProps {
  initialSearch: string;
  status: UserStatus | 'all';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatus | 'all') => void;
}

const STATUS_OPTIONS = Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({
  label,
  value: value as UserStatus | 'all'
}));

const UserFiltersBarComponent: React.FC<UserFiltersBarProps> = ({
  initialSearch,
  status,
  onSearchChange,
  onStatusChange
}) => {
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(localSearch, 400);

  // Propagate changes only when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  return (
    <div className="flex gap-2 items-center flex-1 min-w-[240px]">
      <Input
        placeholder="Search by name or email"
        value={localSearch}
        onChange={handleSearchChange}
        allowClear
      />
      <Select
        className="w-36"
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
      />
    </div>
  );
};

export const UserFiltersBar = memo(UserFiltersBarComponent);
