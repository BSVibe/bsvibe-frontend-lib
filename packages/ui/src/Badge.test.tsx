import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge.js';

describe('<Badge>', () => {
  it('renders children', () => {
    render(<Badge>active</Badge>);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('defaults to neutral variant', () => {
    render(<Badge data-testid="b">x</Badge>);
    expect(screen.getByTestId('b').className).toMatch(/bg-gray-700/);
  });

  it.each([
    ['neutral', /bg-gray-700/],
    ['info', /bg-blue-500/],
    ['success', /bg-emerald-500/],
    ['warning', /bg-amber-500/],
    ['error', /bg-rose-500/],
  ] as const)('variant=%s applies expected style', (variant, pattern) => {
    render(
      <Badge variant={variant} data-testid="b">
        x
      </Badge>,
    );
    expect(screen.getByTestId('b').className).toMatch(pattern);
  });

  it.each([
    ['sm', /px-2/],
    ['md', /px-2\.5/],
  ] as const)('size=%s sets matching size class', (size, pattern) => {
    render(
      <Badge size={size} data-testid="b">
        x
      </Badge>,
    );
    expect(screen.getByTestId('b').className).toMatch(pattern);
  });

  it('renders a leading dot when dot=true', () => {
    render(
      <Badge dot data-testid="b">
        live
      </Badge>,
    );
    expect(screen.getByTestId('b').querySelector('[data-bsvibe-dot]')).toBeTruthy();
  });

  it('forwards className', () => {
    render(
      <Badge className="extra" data-testid="b">
        x
      </Badge>,
    );
    expect(screen.getByTestId('b').className).toMatch(/extra/);
  });
});
