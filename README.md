## High-Volume Users Dashboard

A production-ready React 18 + Vite + TypeScript dashboard that renders 10,000+ users with virtualization, debounced search, sorting, filtering, and optimistic updates over a mocked API.

### Tech Stack

- **React 18**, **TypeScript**, **Vite**
- **Tailwind CSS** for layout and utility styling
- **Ant Design** for UI components
- **TanStack React Query** for server state and optimistic mutations
- **TanStack React Virtual** for row virtualization
- **Axios** (custom base instance with mocked adapter)
- **@faker-js/faker** for generating mock user data

### Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Run the development server**

```bash
npm run dev
```

3. Open the app in your browser at the URL printed by Vite (default: `http://localhost:5173`).

### Key Implementation Details

- **Data generation & caching**
  - `generateUsers` creates 10,000 users with Faker and caches them at module scope so the dataset is created exactly once.
  - A custom Axios adapter simulates `/api/users` (GET) and `/api/users/:id` (PATCH) with an artificial delay of 500–800ms and random failure for updates.

- **Performance & rendering**
  - `UsersTable` uses **TanStack React Virtual** with a fixed-height scroll container to render only visible rows.
  - `UserRow` is wrapped in **`React.memo`** with a custom comparison to avoid unnecessary re-renders.
  - Each row performs an **expensive CPU-bound computation**, memoized via `useMemo` and depending only on `id`, `age`, and `status`.
  - Derived data (search, filter, sort) is computed with **`useMemo`**.
  - Event handlers are wrapped with **`useCallback`** so row props are as stable as possible.

- **Search, filter, sort**
  - Controlled search input with a **400ms debounced value** to avoid recomputing filters on every keystroke.
  - Status filter (all/active/inactive) and sortable columns (name, email, age), all memoized.

- **Optimistic updates**
  - User edits happen in `UserDetailsModal` via an Ant Design `Form`.
  - `useUsers` exposes a React Query mutation with:
    - **Optimistic update** of the cached list.
    - **Random failure simulation (30%)** in the Axios adapter.
    - **Rollback** to previous cache on error.
  - Toast-like feedback uses Ant Design `message` for success and error notifications.

### Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint on the `src` directory

