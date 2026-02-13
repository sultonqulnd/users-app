import type { User } from '@/features/users/types';

const computationCache = new Map<string, number>();
const CACHE_SIZE_LIMIT = 2000; 

export function expensiveComputation(user: Pick<User, 'id' | 'age' | 'status'>): number {
  const cacheKey = `${user.id}-${user.age}-${user.status}`;

  if (computationCache.has(cacheKey)) {
    return computationCache.get(cacheKey)!;
  }

  const base = user.age + (user.status === 'active' ? 10 : -5);
  let acc = base;

  for (let i = 0; i < 50_000; i += 1) {
    acc = (acc * 1.0001) % 97.3;
  }

  if (computationCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = computationCache.keys().next().value;
    if (firstKey) computationCache.delete(firstKey);
  }

  computationCache.set(cacheKey, acc);
  return acc;
}
