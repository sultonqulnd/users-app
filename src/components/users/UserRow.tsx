import React, { useMemo, useCallback } from 'react';
import { Tag } from 'antd';
import type { User } from '../../types/user.types';
import { expensiveComputation } from '../../utils/expensiveComputation';

export interface UserRowProps {
  user: User;
  onClick: (user: User) => void;
  top: number;
  height: number;
}

const UserRowComponent: React.FC<UserRowProps> = ({ user, onClick, top, height }) => {
  // Expensive computation is memoized and depends only on stable primitives.
  const score = useMemo(
    () => expensiveComputation({ id: user.id, age: user.age, status: user.status }),
    [user.id, user.age, user.status]
  );

  const handleClick = useCallback(() => {
    onClick(user);
  }, [onClick, user]);

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height,
    transform: `translateY(${top}px)`
  };

  return (
    <div
      style={style}
      className="grid grid-cols-[2fr,2fr,1fr,1fr,1fr] items-center px-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer text-sm"
      onClick={handleClick}
    >
      <span className="truncate">{user.name}</span>
      <span className="truncate text-slate-600">{user.email}</span>
      <span className="text-center">{user.age}</span>
      <span className="flex justify-center">
        <Tag color={user.status === 'active' ? 'green' : 'default'}>{user.status}</Tag>
      </span>
      <span className="text-center text-xs text-slate-500">{score.toFixed(2)}</span>
    </div>
  );
};

// Custom comparison to avoid unnecessary re-renders
export const UserRow = React.memo(
  UserRowComponent,
  (prev, next) =>
    prev.user.id === next.user.id &&
    prev.user.name === next.user.name &&
    prev.user.email === next.user.email &&
    prev.user.age === next.user.age &&
    prev.user.status === next.user.status &&
    prev.top === next.top &&
    prev.height === next.height &&
    prev.onClick === next.onClick
);

