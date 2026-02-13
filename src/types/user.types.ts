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

