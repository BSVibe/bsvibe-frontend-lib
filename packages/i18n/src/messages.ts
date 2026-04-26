/**
 * Message bundle loader. Two shared namespaces — `common` and `auth` — are
 * shipped with this package. Product packages add their own namespaces and
 * pass them through `getRequestConfig({ extra })`.
 */
import { isSupportedLocale, type Locale } from './config';

import authEn from './messages/auth.en.json' with { type: 'json' };
import authKo from './messages/auth.ko.json' with { type: 'json' };
import commonEn from './messages/common.en.json' with { type: 'json' };
import commonKo from './messages/common.ko.json' with { type: 'json' };

/** Namespaces shipped with `@bsvibe/i18n`. */
export type SharedNamespace = 'common' | 'auth';

/** Generic shape for a translated message tree. */
export type MessageTree = {
  readonly [key: string]: string | MessageTree;
};

const TABLE: Record<SharedNamespace, Record<Locale, MessageTree>> = {
  common: { ko: commonKo as MessageTree, en: commonEn as MessageTree },
  auth: { ko: authKo as MessageTree, en: authEn as MessageTree },
};

/** Load a single namespace for a single locale. Async to mirror RSC usage. */
export async function loadNamespaceMessages(
  namespace: SharedNamespace,
  locale: Locale,
): Promise<MessageTree> {
  if (!isSupportedLocale(locale)) {
    throw new Error(`Unsupported locale: ${String(locale)}`);
  }
  const bundle = TABLE[namespace];
  if (!bundle) {
    throw new Error(`Unknown namespace: ${namespace}`);
  }
  return bundle[locale];
}

/** Sorted dotted keys for a namespace — used by tests + tooling. */
export function getAllMessageKeys(
  namespace: SharedNamespace,
  locale: Locale,
): readonly string[] {
  const tree = TABLE[namespace]?.[locale];
  if (!tree) return [];
  const out: string[] = [];
  const walk = (node: MessageTree, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') out.push(next);
      else walk(v, next);
    }
  };
  walk(tree, '');
  return out.sort();
}

/** Synchronous in-process accessor (handy for SSR/RSC). */
export function getNamespaceMessages(
  namespace: SharedNamespace,
  locale: Locale,
): MessageTree {
  return TABLE[namespace][locale];
}

/** Names of all shared namespaces. */
export const SHARED_NAMESPACES: readonly SharedNamespace[] = ['common', 'auth'];
