import React, { useMemo, useCallback } from 'react';
import { Tag, Spin } from 'antd';
import { useIsMutating } from '@tanstack/react-query';
import { LoadingOutlined } from '@ant-design/icons';
import { expensiveComputation } from '@/features/users/utils/expensiveComputation';
import { GRID_LAYOUT_CLASS } from '@/features/users/constants';
import type { User } from '@/features/users/types';

interface UserRowProps {
  user: User;
  onClick: (user: User) => void;
  top: number;
  height: number;
}

const UserRowComponent: React.FC<UserRowProps> = ({ user, onClick, top, height }) => {
  const score = useMemo(
    () => expensiveComputation({ id: user.id, age: user.age, status: user.status }),
    [user.id, user.age, user.status]
  );
  
  const isMutatingCount = useIsMutating({
    mutationKey: ['update-user'],
    predicate: (mutation) => (mutation.state.variables as any)?.id === user.id
  });
  const isMutating = isMutatingCount > 0;

  const handleClick = useCallback(() => {
    if (!isMutating) {
      onClick(user);
    }
  }, [onClick, user, isMutating]);

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height,
    transform: `translateY(${top}px)`,
    transition: 'background-color 0.2s, opacity 0.2s',
    opacity: isMutating ? 0.6 : 1,
    pointerEvents: isMutating ? 'none' : 'auto',
    backgroundColor: isMutating ? '#f8fafc' : undefined
  };

  return (
    <div
      style={style}
      className={`${GRID_LAYOUT_CLASS} grid items-center px-3 border-b border-slate-100 ${
        !isMutating && 'hover:bg-slate-50 cursor-pointer'
      } text-sm`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        {isMutating && <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />}
        <span className="truncate">{user.name}</span>
      </div>
      <span className="truncate text-slate-600">{user.email}</span>
      <span className="text-center">{user.age}</span>
      <span className="flex justify-center">
        <Tag color={user.status === 'active' ? 'green' : 'default'}>{user.status}</Tag>
      </span>
      <span className={`text-center text-xs ${score > 80 ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
        {score.toFixed(2)}
      </span>
    </div>
  );
};

export const UserRow = React.memo(
  UserRowComponent,
  (prev, next) =>
    prev.user.id === next.user.id &&
    prev.user.name === next.user.name &&
    prev.user.age === next.user.age &&
    prev.user.status === next.user.status &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.onClick === next.onClick
);
