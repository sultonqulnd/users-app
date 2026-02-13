import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersDashboard } from '../components/UsersDashboard';
import * as usersApi from '../api/users.api';
import type { User } from '../types';

vi.mock('@/features/users/components/UserVirtualList', () => ({
  UserVirtualList: ({ users, onRowClick }: { users: User[]; onRowClick: (u: User) => void }) => (
    <div data-testid="virtual-list">
      {users.map((u) => (
        <div 
          key={u.id} 
          data-testid="user-row" 
          onClick={() => onRowClick(u)}
          style={{ cursor: 'pointer', padding: '10px' }}
        >
          {u.name}
        </div>
      ))}
    </div>
  )
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn()
    }
  };
});

const mockUsers = [
  { id: '1', name: 'Original Name', email: 'test@example.com', age: 30, status: 'active' }
];

describe('Generic Optimistic UI Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
      }
    });

    vi.restoreAllMocks();
    vi.spyOn(usersApi, 'fetchUsers').mockResolvedValue(mockUsers as unknown as User[]);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should optimistically update UI immediately and rollback on API failure', async () => {
    const user = userEvent.setup();
    
    const patchSpy = vi.spyOn(usersApi, 'patchUser').mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Network Error');
    });

    render(
      <QueryClientProvider client={queryClient}>
        <UsersDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('Original Name')).toBeInTheDocument());

    await user.click(screen.getByText('Original Name'));
    
    const nameInput = await screen.findByLabelText('Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Optimistic Name');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(await screen.findByText('Optimistic Name')).toBeInTheDocument();
    expect(screen.queryByText('Original Name')).not.toBeInTheDocument();

    await waitFor(() => expect(patchSpy).toHaveBeenCalled());
    
    await waitFor(() => {
      expect(screen.queryByText('Optimistic Name')).not.toBeInTheDocument();
      expect(screen.getByText('Original Name')).toBeInTheDocument();
    });
  });
});
