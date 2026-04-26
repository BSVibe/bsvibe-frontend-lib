import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

// next/navigation: capture router.replace calls.
const mockReplace = vi.fn<(href: string) => void>();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// We mock @bsvibe/auth's useAuth so we can drive isLoading / user state.
let authState: {
  user: unknown;
  isLoading: boolean;
} = { user: null, isLoading: true };

vi.mock('@bsvibe/auth', () => ({
  useAuth: () => authState,
}));

function setAuth(next: typeof authState) {
  authState = next;
}

function Child(): ReactNode {
  return <p data-testid="child">protected</p>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    authState = { user: null, isLoading: true };
  });

  it('shows the fallback while auth is loading', () => {
    render(
      <ProtectedRoute fallback={<p data-testid="loading">…</p>}>
        <Child />
      </ProtectedRoute>,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('renders children when authenticated', () => {
    setAuth({ user: { id: 'u1', email: 'a@b' }, isLoading: false });
    render(
      <ProtectedRoute>
        <Child />
      </ProtectedRoute>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('redirects via router.replace when unauthenticated and not loading', async () => {
    setAuth({ user: null, isLoading: false });
    render(
      <ProtectedRoute redirectTo="/login">
        <Child />
      </ProtectedRoute>,
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
  });

  it('does NOT call replace while loading (avoids navigate-during-render)', async () => {
    setAuth({ user: null, isLoading: true });
    render(
      <ProtectedRoute redirectTo="/login">
        <Child />
      </ProtectedRoute>,
    );
    // Allow any pending effects to flush.
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not render children while redirecting', () => {
    setAuth({ user: null, isLoading: false });
    render(
      <ProtectedRoute redirectTo="/login">
        <Child />
      </ProtectedRoute>,
    );
    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('uses /login as the default redirect target', async () => {
    setAuth({ user: null, isLoading: false });
    render(
      <ProtectedRoute>
        <Child />
      </ProtectedRoute>,
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
  });
});
