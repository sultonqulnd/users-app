import type { User } from '../types/user.types';

export function expensiveComputation(user: Pick<User, 'id' | 'age' | 'status'>): number {
  const base = user.age + (user.status === 'active' ? 10 : -5);
  let acc = base;

  for (let i = 0; i < 50_000; i += 1) {
    acc = (acc * 1.0001) % 97.3;
  }

  return acc;
}

