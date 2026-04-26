/**
 * Client provider. Thin wrapper around `next-intl`'s `NextIntlClientProvider`,
 * pre-baked with the BSVibe locale type and a sensible default `now`/timezone
 * fallback so products don't have to think about hydration warnings.
 */
'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import { DEFAULT_LOCALE, type Locale, resolveLocale } from './config';
import type { MessageTree } from './messages';

export interface BSVibeIntlProviderProps {
  locale: Locale | string;
  messages: Record<string, MessageTree>;
  /** Stable timestamp for relative-time formatting (defaults to render time). */
  now?: Date;
  /** IANA timezone (defaults to host TZ). */
  timeZone?: string;
  children: ReactNode;
}

export function BSVibeIntlProvider({
  locale,
  messages,
  now,
  timeZone,
  children,
}: BSVibeIntlProviderProps) {
  const resolved = resolveLocale(locale, DEFAULT_LOCALE);
  return (
    <NextIntlClientProvider
      locale={resolved}
      messages={messages as Record<string, unknown>}
      now={now}
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
