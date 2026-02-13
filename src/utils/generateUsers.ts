import { faker } from '@faker-js/faker';
import type { User, UserStatus } from '../types/user.types';

// Cache generated users at module scope so the "API" reuses them.
let cachedUsers: User[] | null = null;

const STATUSES: UserStatus[] = ['active', 'inactive'];

export const TOTAL_USERS = 10_000;

export function generateUsers(count: number = TOTAL_USERS): User[] {
  if (cachedUsers && cachedUsers.length === count) {
    return cachedUsers;
  }

  const users: User[] = [];

  for (let i = 0; i < count; i += 1) {
    const status = faker.helpers.arrayElement(STATUSES);

    users.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      age: faker.number.int({ min: 18, max: 80 }),
      status
    });
  }

  cachedUsers = users;
  return users;
}

export function getCachedUsers(): User[] {
  if (!cachedUsers) {
    cachedUsers = generateUsers(TOTAL_USERS);
  }
  return cachedUsers;
}

export function updateCachedUser(partial: { id: string; name?: string; age?: number }): User | null {
  if (!cachedUsers) {
    cachedUsers = generateUsers(TOTAL_USERS);
  }

  const idx = cachedUsers.findIndex((u) => u.id === partial.id);
  if (idx === -1) {
    return null;
  }

  const current = cachedUsers[idx];
  const updated: User = {
    ...current,
    ...('name' in partial ? { name: partial.name } : {}),
    ...('age' in partial ? { age: partial.age } : {})
  };

  cachedUsers[idx] = updated;
  return updated;
}

