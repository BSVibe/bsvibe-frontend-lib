import { useEffect, useRef, useState } from "react";

export interface DemoSessionReady {
  tenantId: string;
  token: string;
  expiresIn: number;
}

export interface DemoSessionState {
  /** True while the initial POST /api/v1/demo/session is in flight. */
  loading: boolean;
  /** Active demo tenant_id (UUID string) once the session is ready. */
  tenantId: string | null;
  /** Demo JWT (HS256, 2h exp). Use as Bearer token for API calls. */
  token: string | null;
  /** Token TTL in seconds (typically 7200 = 2h). */
  expiresIn: number | null;
  /** Set when session creation failed. */
  error: string | null;
}

export interface UseAutoDemoSessionOptions {
  /**
   * Optional callback fired exactly once when the session is ready.
   * Use this to stash the demo JWT in the product's existing token
   * cache so `getAccessToken()` (or equivalent) returns it. Without
   * this hook-up, browser-side data fetches go out without
   * Authorization and the demo dashboard sits empty.
   */
  onSessionReady?: (session: DemoSessionReady) => void;
}

/**
 * Auto-creates a demo session on mount by hitting the backend's
 * `POST /api/v1/demo/session`. Idempotent on the same browser — the
 * backend issues a cookie, so subsequent reloads reuse it.
 *
 * Pass the API base URL (e.g. `https://api-demo-gateway.bsvibe.dev`).
 * Credentials must be sent so cookies cross subdomains.
 */
export function useAutoDemoSession(
  apiBaseUrl: string,
  options: UseAutoDemoSessionOptions = {},
): DemoSessionState {
  const [state, setState] = useState<DemoSessionState>({
    loading: true,
    tenantId: null,
    token: null,
    expiresIn: null,
    error: null,
  });
  const onReadyRef = useRef(options.onSessionReady);
  onReadyRef.current = options.onSessionReady;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function start() {
      try {
        const resp = await fetch(`${apiBaseUrl}/api/v1/demo/session`, {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
        });
        if (!resp.ok) {
          throw new Error(`demo session failed (${resp.status})`);
        }
        const body = (await resp.json()) as {
          tenant_id: string;
          token: string;
          expires_in: number;
        };
        if (cancelled) return;
        setState({
          loading: false,
          tenantId: body.tenant_id,
          token: body.token,
          expiresIn: body.expires_in,
          error: null,
        });
        if (onReadyRef.current) {
          onReadyRef.current({
            tenantId: body.tenant_id,
            token: body.token,
            expiresIn: body.expires_in,
          });
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "demo session error";
        setState({
          loading: false,
          tenantId: null,
          token: null,
          expiresIn: null,
          error: msg,
        });
      }
    }

    void start();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiBaseUrl]);

  return state;
}
