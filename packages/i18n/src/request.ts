/**
 * Request-side i18n config loader. Products call this from
 * `i18n/request.ts` (next-intl convention) to compose shared namespaces with
 * their product-local messages.
 *
 * Example:
 *
 *   // app/i18n/request.ts
 *   import { getRequestConfig } from '@bsvibe/i18n/config';
 *   export default getRequestConfig(async ({ locale }) => ({
 *     locale,
 *     extra: { gateway: (await import(`./messages/gateway.${locale}.json`)).default },
 *   }));
 */
import {
  DEFAULT_LOCALE,
  resolveLocale,
  type Locale,
} from './config';
import {
  SHARED_NAMESPACES,
  getNamespaceMessages,
  type MessageTree,
} from './messages';

export interface RequestConfigArgs {
  /** Locale supplied by Next.js routing — may be unsupported / undefined. */
  locale: string | undefined;
  /** Optional product-local namespaces to layer on top. */
  extra?: Record<string, MessageTree>;
}

export interface RequestConfig {
  locale: Locale;
  messages: Record<string, MessageTree>;
}

/**
 * Pure helper: combine shared + extra namespaces. Extra wins on collision so
 * products can override a single shared key without forking the whole bundle.
 */
export function mergeMessages(
  namespaces: Record<string, MessageTree>,
): Record<string, MessageTree> {
  return { ...namespaces };
}

export async function getRequestConfig(
  args: RequestConfigArgs,
): Promise<RequestConfig> {
  const locale = resolveLocale(args.locale, DEFAULT_LOCALE);

  const shared: Record<string, MessageTree> = {};
  for (const ns of SHARED_NAMESPACES) {
    shared[ns] = getNamespaceMessages(ns, locale);
  }

  return {
    locale,
    messages: mergeMessages({ ...shared, ...(args.extra ?? {}) }),
  };
}
