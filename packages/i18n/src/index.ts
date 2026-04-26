/**
 * @bsvibe/i18n — next-intl wrapper for the BSVibe ecosystem.
 *
 * Phase A surface (D15: next-intl 4.x + Next.js 15 App Router):
 *  - createI18nConfig() — locale set + URL prefix policy
 *  - createI18nMiddleware() / defaultMatcher — Next.js middleware
 *  - BSVibeIntlProvider — Client provider for App Router root
 *  - useT() / useCurrentLocale() — typed hooks (next-intl wrappers)
 *  - getRequestConfig() — server-side message bundle composer
 *  - shared `common` + `auth` namespaces (ko/en)
 *
 * Sub-path entries (`@bsvibe/i18n/middleware`, `/provider`, `/config`,
 * `/hooks`) preserve App Router boundaries — middleware import does not pull
 * client-only code into Edge runtime, etc.
 */

export {
  DEFAULT_LOCALE,
  LOCALES,
  createI18nConfig,
  isSupportedLocale,
  resolveLocale,
} from './config';
export type {
  CreateI18nConfigOptions,
  I18nConfig,
  Locale,
  LocalePrefix,
} from './config';

export {
  SHARED_NAMESPACES,
  getAllMessageKeys,
  getNamespaceMessages,
  loadNamespaceMessages,
} from './messages';
export type { MessageTree, SharedNamespace } from './messages';

export { getRequestConfig, mergeMessages } from './request';
export type { RequestConfig, RequestConfigArgs } from './request';

export { createI18nMiddleware, defaultMatcher } from './middleware';

export { BSVibeIntlProvider } from './provider';
export type { BSVibeIntlProviderProps } from './provider';

export { useCurrentLocale, useT } from './hooks';
