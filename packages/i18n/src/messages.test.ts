/**
 * Drift guard: every namespace's ko ↔ en JSON must share the exact same key
 * tree. This catches "string added in one locale only" regressions, which are
 * a top source of broken UI in shipped i18n.
 */
import { describe, expect, it } from 'vitest';

import authEn from './messages/auth.en.json' with { type: 'json' };
import authKo from './messages/auth.ko.json' with { type: 'json' };
import commonEn from './messages/common.en.json' with { type: 'json' };
import commonKo from './messages/common.ko.json' with { type: 'json' };
import { getAllMessageKeys, loadNamespaceMessages } from './messages';

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    out.push(...flatten(v, next));
  }
  return out.sort();
}

describe('message JSON parity (ko ↔ en drift guard)', () => {
  it('common.ko and common.en share the same key tree', () => {
    expect(flatten(commonKo)).toEqual(flatten(commonEn));
  });

  it('auth.ko and auth.en share the same key tree', () => {
    expect(flatten(authKo)).toEqual(flatten(authEn));
  });

  it('common namespace has at least 30 strings (baseline)', () => {
    expect(flatten(commonKo).length).toBeGreaterThanOrEqual(30);
  });

  it('auth namespace has at least 20 strings (baseline)', () => {
    expect(flatten(authKo).length).toBeGreaterThanOrEqual(20);
  });

  it('every leaf value is a non-empty string in both locales', () => {
    for (const obj of [commonKo, commonEn, authKo, authEn]) {
      const stack: unknown[] = [obj];
      while (stack.length) {
        const cur = stack.pop();
        if (cur && typeof cur === 'object') {
          stack.push(...Object.values(cur as Record<string, unknown>));
        } else {
          expect(typeof cur).toBe('string');
          expect((cur as string).length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('loadNamespaceMessages', () => {
  it('loads common ko namespace', async () => {
    const msgs = await loadNamespaceMessages('common', 'ko');
    expect(msgs.actions.save).toBe('저장');
  });

  it('loads common en namespace', async () => {
    const msgs = await loadNamespaceMessages('common', 'en');
    expect(msgs.actions.save).toBe('Save');
  });

  it('loads auth ko namespace', async () => {
    const msgs = await loadNamespaceMessages('auth', 'ko');
    expect(msgs.actions.signIn).toBe('로그인');
  });

  it('loads auth en namespace', async () => {
    const msgs = await loadNamespaceMessages('auth', 'en');
    expect(msgs.actions.signIn).toBe('Sign in');
  });

  it('throws for an unsupported locale', async () => {
    await expect(
      loadNamespaceMessages('common', 'fr' as 'en'),
    ).rejects.toThrow(/locale/i);
  });
});

describe('getAllMessageKeys', () => {
  it('returns dotted keys for a namespace, sorted', () => {
    const keys = getAllMessageKeys('common', 'ko');
    expect(keys).toContain('actions.save');
    expect(keys).toContain('errors.generic');
    expect([...keys]).toEqual([...keys].sort());
  });
});
