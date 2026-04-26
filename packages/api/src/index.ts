/**
 * @bsvibe/api — BSVibe API client for Next.js 15 + legacy Vite consumers.
 *
 * Phase A extraction. Replaces the ~40 LoC fetch/axios wrapper duplicated
 * across BSGateway / BSNexus / BSage / BSupervisor with a single shared
 * implementation.
 *
 * Public surface:
 *  - createApiFetch()        — Server / RSC / Client fetch wrapper.
 *  - createServerAction()    — Next.js 15 Server Action envelope wrapper.
 *  - createRouteAdapter()    — Vercel `(req,res)` → Next.js Route Handler.
 *  - readDualEnv()           — NEXT_PUBLIC_X ?? VITE_X ?? default reader.
 *  - setOnAuthError()        — register the 401 cascading-logout callback.
 *  - handleAuthError()       — manually fire the 401 latch.
 *  - resetAuthErrorGuard()   — re-arm after silent re-login.
 *  - ApiError                — Error subclass thrown for non-2xx responses.
 */

export {
  ApiError,
  createApiFetch,
  type ApiClient,
  type CreateApiFetchOptions,
  type RequestOptions,
} from './fetch';

export {
  createServerAction,
  type ServerActionError,
  type ServerActionHandler,
  type ServerActionResult,
} from './server-action';

export {
  createRouteAdapter,
  vercelToRoute,
  type VercelLikeReq,
  type VercelLikeRes,
  type VercelStyleHandler,
} from './adapter';

export { readDualEnv, type ReadDualEnvOptions } from './env';

export {
  handleAuthError,
  isAuthErrorGuardEngaged,
  resetAuthErrorGuard,
  setOnAuthError,
} from './auth';
