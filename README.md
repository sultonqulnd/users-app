# High-Volume Users Dashboard

## 🚀 Overview

This project is a high-performance React application designed to manage large datasets (10k-100k+ records) with a focus on rendering efficiency, maintainability, and user experience. It serves as a technical demonstration of senior-level frontend architecture decisions, specifically targeting bottlenecks common in data-heavy internal tools.

## 🏗 Architecture Decisions

### Feature-Sliced Design (Inspired)
The codebase follows a modular, feature-based architecture located in `src/features/users/`. This encapsulates all domain logic, components, types, and hooks specific to the "Users" domain, preventing tight coupling with the global app structure.

- **`api/`**: Strictly typed API layer with generic return types.
- **`components/`**: Atomic, focused UI components (`UserRow`, `UserFiltersBar`, `UserVirtualList`).
- **`hooks/`**: Custom hooks separating **Server State** (`useUsersQuery`, `useUserMutation`) from **UI State** (`useUsersDashboard`).
- **`types/`**: Centralized domain definitions to ensure contract consistency.
- **`utils/`**: Pure functions for heavy computations and mock generation.

### Separation of Concerns
We strictly separate **Data Fetching** (React Query) from **View Logic**. The `UsersDashboard` component acts as a layout controller, composing specialized sub-components (`UserFiltersBar`, `UserSortControls`, `UserVirtualList`) rather than managing monolithic state. This minimizes re-render scope.

## ⚡ Rendering & Performance Strategy

### 1. Virtualization (`@tanstack/react-virtual`)
Rendering 10,000+ DOM nodes crashes standard browsers. We utilize windowing to render only the items currently visible in the viewport.
- **Node Reduction**: Virtualization reduces DOM nodes from **10,000 to ~20 visible rows**, maintaining a constant memory footprint.
- **Fixed Row Heights**: We enforce a `56px` row height (`ROW_HEIGHT` constant) to ensure O(1) scroll position calculations.
- **Stable Layouts**: The `UserVirtualList` uses a flex-based layout (`flex-1 min-h-0`) to adapt responsively without Javascript listeners.

### 2. Memoization & Stability
We employ a multi-layered verification strategy to prevent wasted cycles:
- **`React.memo`**: Prevents row re-renders when parent state (search/filter) changes but the row data remains identical.
- **`useMemo`**: Prevents expensive recalculations (e.g., score logic) on every render.
- **Stable Callbacks**: `useCallback` ensures handlers passed to children do not trigger unnecessary diffs.
- **Global Cache**: `expensiveComputation` uses an LRU-like global Map to persist calculations across row unmounts/remounts.

### 3. State Management Strategy
- **Server State**: Handled by **React Query**. Data is cached, deduplicated, and synchronized with the backend automatically.
- **UI State**: Kept local (or in specialized hooks like `useUsersDashboard`) to prevent global re-renders. Keystrokes in filters, for example, do not trigger re-renders in the heavy list.

## 🔄 Optimistic Updates & UX

We implement "Optimistic UI" to make the app feel instant:
1.  **Instant Feedback**: The UI updates immediately, avoiding unnecessary full list refetches. This improves perceived responsiveness and reduces network load.
2.  **Snapshot & Rollback**: We snapshot the specific user state before mutation. If the API fails, we rollback *only* that user.
3.  **Inline Loading**: `UserRow` tracks its own mutation status, applying a local opacity effect instead of blocking the entire table.

## 📈 Scalability Considerations (100k+ Users)

If this application were scaled to 100,000+ users, the following optimizations would be prioritized:
- **Server-Side Pagination**: Switching from client-side to server-side slicing to reduce initial payload size.
- **Windowing + Lazy Loading**: Combining virtualization with "infinite scroll" queries to load data chunks only as the user scrolls.
- **Web Workers**: Offloading heavy sorting and filtering logic to a background thread to keep the main UI thread buttery smooth.

## ⚖️ Performance Trade-offs

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| **Client-Side Filtering** | Instant feedback for small-to-medium datasets (<10k). | **Main Thread Blocking**: Sorting 100k items synchronously blocks the UI. *Mitigation: Debounced inputs.* |
| **Strict Virtualization** | Constant memory usage regardless of list size. | **Searchability**: Browser's native `Ctrl+F` cannot find off-screen content. |
| **Global Memoization** | Zero-cost re-renders during scrolling. | **Memory Overhead**: The global cache consumes memory indefinitely unless capped (we implemented a 2000-item limit). |

## 🛠 Tech Stack

- **React 18**: Core UI library.
- **TypeScript**: Strict type safety preventing runtime errors.
- **TanStack Query (v5)**: Async state management.
- **TanStack Virtual**: Headless UI for virtualization.
- **Ant Design**: Component library (inputs, modals, notifications).
- **Axios**: HTTP client with interceptors for error normalization.
- **Vite**: Next-generation frontend tooling.

---

### How to Run

1.  Install dependencies: `pnpm install`
2.  Start development server: `pnpm run dev`
3.  Build for production: `pnpm run build`
