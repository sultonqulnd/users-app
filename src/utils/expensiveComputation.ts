import type { User } from '../types/user.types';

/**
 * Simulates an expensive CPU-bound computation per row.
 * This is intentionally heavy to stress rendering performance.
 */
export function expensiveComputation(user: Pick<User, 'id' | 'age' | 'status'>): number {
  // Use deterministic input so memoization works as expected.
  const base = user.age + (user.status === 'active' ? 10 : -5);
  let acc = base;

  // Tight loop with math operations.
  // The iteration count is high enough to be non-trivial but
  // not so high that the UI becomes unusable.
  for (let i = 0; i < 50_000; i += 1) {
    acc = (acc * 1.0001) % 97.3;
  }

  return acc;
}

