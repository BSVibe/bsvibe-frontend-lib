/**
 * Locale configuration shared across all BSVibe assets.
 *
 * Default locale is `ko`. `en` is the secondary baseline. Phase C may add more
 * locales — when it does, also extend the message JSON under
 * `src/messages/{namespace}.{locale}.json` and re-run the parity guard test.
 */

/** Supported locales. Order is intentional: default first. */
export const LOCALES = ['ko', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Default locale used when no preference is supplied or detection fails. */
export const DEFAULT_LOCALE: Locale = 'ko';

/**
 * URL prefix strategy:
 *  - 'as-needed': default locale has no prefix (`/`), others get `/en`.
 *  - 'always':    every locale gets a prefix (`/ko`, `/en`).
 *  - 'never':     no prefix; locale resolved by other means (cookie/header).
 */
export type LocalePrefix = 'as-needed' | 'always' | 'never';

export interface I18nConfig<L extends string = Locale> {
  locales: readonly L[];
  defaultLocale: L;
  localePrefix: LocalePrefix;
}

export interface CreateI18nConfigOptions<L extends string = Locale> {
  locales?: readonly L[];
  defaultLocale?: L;
  localePrefix?: LocalePrefix;
}

/**
 * Type-guard for `Locale`. Accepts the default locale set; product code can
 * widen with its own union if it ever supports extra locales.
 */
export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick a usable locale, falling back to `fallback` (default: DEFAULT_LOCALE).
 * Useful for normalising whatever Next.js / Accept-Language hands us.
 */
export function resolveLocale(value: unknown, fallback: Locale = DEFAULT_LOCALE): Locale {
  return isSupportedLocale(value) ? value : fallback;
}

/**
 * Build the canonical i18n config consumed by middleware + provider. Throws if
 * `defaultLocale` is not in `locales` — that combination would silently break
 * locale resolution.
 */
export function createI18nConfig<L extends string = Locale>(
  opts: CreateI18nConfigOptions<L> = {},
): I18nConfig<L> {
  const locales = (opts.locales ?? (LOCALES as readonly string[] as readonly L[]));
  const defaultLocale = (opts.defaultLocale ?? (DEFAULT_LOCALE as unknown as L));
  const localePrefix = opts.localePrefix ?? 'as-needed';

  if (!locales.includes(defaultLocale)) {
    throw new Error(
      `i18n config: defaultLocale "${String(defaultLocale)}" is not in locales [${locales.join(', ')}]`,
    );
  }

  return { locales, defaultLocale, localePrefix };
}
