export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  details: (id: string) => ['users', id] as const,
};

export const GRID_LAYOUT_CLASS = "grid-cols-[2fr,2fr,1fr,1fr,1fr]";

export const USER_STATUS_LABELS = {
  all: 'All statuses',
  active: 'Active',
  inactive: 'Inactive',
} as const;

export const ROW_HEIGHT = 56;
