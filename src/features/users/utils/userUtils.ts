import type { User, SortKey, SortDirection, UserStatus } from '../types';

export function filterUsers(users: User[], search: string, status: 'all' | UserStatus): User[] {
  const searchLower = search.trim().toLowerCase();
  
  if (!searchLower && status === 'all') {
    return users;
  }

  return users.filter((user) => {
    if (searchLower) {
      const matchName = user.name.toLowerCase().includes(searchLower);
      const matchEmail = user.email.toLowerCase().includes(searchLower);
      if (!matchName && !matchEmail) {
        return false;
      }
    }

    if (status !== 'all' && user.status !== status) {
      return false;
    }

    return true;
  });
}

export function sortUsers(users: User[], sortKey: SortKey, sortDirection: SortDirection): User[] {
  const copied = [...users];
  const direction = sortDirection === 'asc' ? 1 : -1;

  return copied.sort((a, b) => {
    if (sortKey === 'age') {
      return (a.age - b.age) * direction;
    }

    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();

    if (aVal < bVal) return -1 * direction;
    if (aVal > bVal) return 1 * direction;
    return 0;
  });
}
