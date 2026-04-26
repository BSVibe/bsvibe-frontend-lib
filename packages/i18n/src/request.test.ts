import { describe, expect, it } from 'vitest';

import { getRequestConfig, mergeMessages } from './request';

describe('mergeMessages', () => {
  it('merges multiple namespaces under their key', () => {
    const merged = mergeMessages({
      common: { hello: 'Hello' },
      auth: { signIn: 'Sign in' },
    });
    expect(merged).toEqual({
      common: { hello: 'Hello' },
      auth: { signIn: 'Sign in' },
    });
  });

  it('returns an empty object for no namespaces', () => {
    expect(mergeMessages({})).toEqual({});
  });
});

describe('getRequestConfig', () => {
  it('loads ko shared namespaces', async () => {
    const cfg = await getRequestConfig({ locale: 'ko' });
    expect(cfg.locale).toBe('ko');
    // shape: { common: {...}, auth: {...} }
    expect(cfg.messages.common).toBeDefined();
    expect(cfg.messages.auth).toBeDefined();
    expect((cfg.messages.common as { actions: { save: string } }).actions.save).toBe('저장');
  });

  it('loads en shared namespaces', async () => {
    const cfg = await getRequestConfig({ locale: 'en' });
    expect(cfg.locale).toBe('en');
    expect(
      (cfg.messages.auth as { actions: { signIn: string } }).actions.signIn,
    ).toBe('Sign in');
  });

  it('falls back to default locale when given an unsupported one', async () => {
    const cfg = await getRequestConfig({ locale: 'fr' });
    expect(cfg.locale).toBe('ko');
  });

  it('merges product-supplied extra namespaces', async () => {
    const cfg = await getRequestConfig({
      locale: 'en',
      extra: { gateway: { home: 'Home' } },
    });
    expect((cfg.messages.gateway as { home: string }).home).toBe('Home');
    // shared still present
    expect(cfg.messages.common).toBeDefined();
  });
});
