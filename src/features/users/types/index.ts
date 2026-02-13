export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: UserStatus;
}

export interface UpdateUserPayload {
  id: string;
  name: string;
  age: number;
}

export type SortKey = 'name' | 'email' | 'age';
export type SortDirection = 'asc' | 'desc';

export interface UserFilters {
  search: string;
  status: UserStatus | 'all';
  sortKey: SortKey;
  sortDirection: SortDirection;
}
