import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAuditPermission } from './useAuditPermission';

// Mock @bsvibe/auth — we only need useAuth, not the full provider.
const useAuthMock = vi.fn();
vi.mock('@bsvibe/auth', () => ({
  useAuth: () => useAuthMock(),
}));

interface ProbeProps {
  onResult: (
    result: ReturnType<typeof useAuditPermission>,
  ) => void;
}

function Probe({ onResult }: ProbeProps): ReactNode {
  const result = useAuditPermission();
  onResult(result);
  return <span data-testid="probe">{String(result.canRead)}</span>;
}

describe('useAuditPermission', () => {
  it('returns canRead=false when no active tenant', () => {
    useAuthMock.mockReturnValue({
      activeTenant: null,
      hasPermission: vi.fn(() => false),
    });
    const seen = vi.fn();
    render(<Probe onResult={seen} />);
    expect(seen).toHaveBeenCalledWith({
      canRead: false,
      planAllows: false,
      permissionGranted: false,
      requiredPlan: 'enterprise',
      requiredPermission: 'core.audit.read',
    });
  });

  it('returns canRead=false when plan is not enterprise', () => {
    useAuthMock.mockReturnValue({
      activeTenant: { id: 't1', name: 'Acme', type: 'org', role: 'owner', plan: 'team' },
      hasPermission: vi.fn(() => true),
    });
    const seen = vi.fn();
    render(<Probe onResult={seen} />);
    expect(seen).toHaveBeenCalledWith(
      expect.objectContaining({
        canRead: false,
        planAllows: false,
        permissionGranted: true,
      }),
    );
  });

  it('returns canRead=true when enterprise plan + permission granted', () => {
    const hasPermission = vi.fn((p: string) => p === 'core.audit.read');
    useAuthMock.mockReturnValue({
      activeTenant: { id: 't1', name: 'Acme', type: 'org', role: 'owner', plan: 'enterprise' },
      hasPermission,
    });
    render(<Probe onResult={() => {}} />);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
    expect(hasPermission).toHaveBeenCalledWith('core.audit.read');
  });

  it('returns canRead=false on enterprise plan without permission', () => {
    useAuthMock.mockReturnValue({
      activeTenant: { id: 't1', name: 'Acme', type: 'org', role: 'viewer', plan: 'enterprise' },
      hasPermission: vi.fn(() => false),
    });
    const seen = vi.fn();
    render(<Probe onResult={seen} />);
    expect(seen).toHaveBeenCalledWith(
      expect.objectContaining({
        canRead: false,
        planAllows: true,
        permissionGranted: false,
      }),
    );
  });
});
