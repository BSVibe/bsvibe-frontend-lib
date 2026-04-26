import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { makeAuthedLayout } from './makeAuthedLayout';

// Mock next/navigation: replace + dynamic pathname so ResponsiveSidebar renders.
const mockReplace = vi.fn<(href: string) => void>();
const mockUsePathname = vi.fn<() => string>(() => '/');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

let authState: { user: unknown; isLoading: boolean } = { user: null, isLoading: true };
vi.mock('@bsvibe/auth', () => ({
  useAuth: () => authState,
}));

describe('makeAuthedLayout', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    authState = { user: null, isLoading: true };
  });

  it('returns a component that gates children on auth and wraps them in AppShell', () => {
    const AuthedLayout = makeAuthedLayout({
      sidebar: <nav data-testid="sb" />,
      header: <div data-testid="hdr" />,
    });

    authState = { user: { id: 'u1', email: 'x@y' }, isLoading: false };
    render(
      <AuthedLayout>
        <p data-testid="content">page</p>
      </AuthedLayout>,
    );
    expect(screen.getByTestId('sb')).toBeInTheDocument();
    expect(screen.getByTestId('hdr')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated', async () => {
    const AuthedLayout = makeAuthedLayout({
      sidebar: <nav />,
    });

    authState = { user: null, isLoading: false };
    render(
      <AuthedLayout>
        <p>x</p>
      </AuthedLayout>,
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
  });

  it('honors custom redirectTo + fallback', () => {
    const AuthedLayout = makeAuthedLayout({
      sidebar: <nav />,
      redirectTo: '/auth/start',
      fallback: <p data-testid="boot">booting</p>,
    });

    authState = { user: null, isLoading: true };
    render(
      <AuthedLayout>
        <p>x</p>
      </AuthedLayout>,
    );
    expect(screen.getByTestId('boot')).toBeInTheDocument();
  });
});
