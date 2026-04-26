import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BSVibeIntlProvider } from './provider';
import { useT, useCurrentLocale } from './hooks';

function CommonSave() {
  const t = useT('common');
  return <span>{t('actions.save')}</span>;
}

function AuthSignIn() {
  const t = useT('auth');
  return <span>{t('actions.signIn')}</span>;
}

function LocaleProbe() {
  const locale = useCurrentLocale();
  return <span>locale:{locale}</span>;
}

describe('BSVibeIntlProvider + useT', () => {
  it('renders ko translations from common namespace', async () => {
    const messages = {
      common: (await import('./messages/common.ko.json')).default,
      auth: (await import('./messages/auth.ko.json')).default,
    };
    render(
      <BSVibeIntlProvider locale="ko" messages={messages}>
        <CommonSave />
      </BSVibeIntlProvider>,
    );
    expect(screen.getByText('저장')).toBeInTheDocument();
  });

  it('renders en translations from auth namespace', async () => {
    const messages = {
      common: (await import('./messages/common.en.json')).default,
      auth: (await import('./messages/auth.en.json')).default,
    };
    render(
      <BSVibeIntlProvider locale="en" messages={messages}>
        <AuthSignIn />
      </BSVibeIntlProvider>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('exposes the current locale via useCurrentLocale', async () => {
    const messages = {
      common: (await import('./messages/common.en.json')).default,
      auth: (await import('./messages/auth.en.json')).default,
    };
    render(
      <BSVibeIntlProvider locale="en" messages={messages}>
        <LocaleProbe />
      </BSVibeIntlProvider>,
    );
    expect(screen.getByText('locale:en')).toBeInTheDocument();
  });
});
