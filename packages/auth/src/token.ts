import type { BSVibeUser } from '@bsvibe/types';

export function parseToken(
  accessToken: string,
  refreshToken: string,
): BSVibeUser {
  const parts = accessToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payloadSegment = parts[1];
  if (!payloadSegment) {
    throw new Error('Invalid JWT format');
  }
  let base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  const payload = JSON.parse(atob(base64));

  return {
    id: payload.sub,
    email: payload.email,
    tenantId: payload.app_metadata?.tenant_id ?? '',
    role: payload.app_metadata?.role ?? 'member',
    accessToken,
    refreshToken,
    expiresAt: payload.exp,
  };
}
