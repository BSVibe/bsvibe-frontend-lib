/**
 * createServerAction — Next.js 15 Server Action wrapper.
 *
 * Wraps an async handler so it returns a typed envelope instead of throwing.
 * Server Actions that throw raw errors crash the React tree (Next.js
 * surfaces a generic "An error occurred" UI), and ApiError details that
 * are useful for showing inline form errors get scrubbed away.
 *
 * The envelope is a discriminated union so callers can pattern-match:
 *
 *   const result = await updateProject(input);
 *   if (!result.ok) {
 *     toast.error(result.error.message);
 *     return;
 *   }
 *   router.push(`/projects/${result.data.id}`);
 *
 * 401-on-handler also engages the cascading-logout guard so a logout
 * banner can be surfaced from the next mount cycle.
 */

import { handleAuthError } from './auth';
import { ApiError } from './fetch';

export interface ServerActionError {
  status: number;
  message: string;
}

export type ServerActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServerActionError };

export type ServerActionHandler<TInput, TOutput> = (
  input: TInput,
) => Promise<TOutput>;

export function createServerAction<TInput, TOutput>(
  handler: ServerActionHandler<TInput, TOutput>,
): (input: TInput) => Promise<ServerActionResult<TOutput>> {
  return async (input: TInput) => {
    try {
      const data = await handler(input);
      return { ok: true, data };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) handleAuthError();
        return { ok: false, error: { status: err.status, message: err.message } };
      }
      if (err instanceof Error) {
        return { ok: false, error: { status: 500, message: err.message } };
      }
      return { ok: false, error: { status: 500, message: 'Unknown error' } };
    }
  };
}
