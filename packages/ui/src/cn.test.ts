import { describe, expect, it } from 'vitest';
import { cn } from './cn.js';

describe('cn', () => {
  it('joins string args with single spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('object form keeps keys whose value is truthy', () => {
    expect(cn('base', { active: true, disabled: false, hidden: undefined })).toBe('base active');
  });

  it('returns empty string when no truthy args', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('mixes strings and objects in order', () => {
    expect(cn('a', { b: true }, 'c', { d: false, e: true })).toBe('a b c e');
  });
});
