import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.js';

describe('<Button>', () => {
  it('renders children inside a <button>', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('defaults to type=button (does not submit forms accidentally)', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('honors explicit type=submit', () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-blue-500/);
  });

  it.each([
    ['primary', /bg-blue-500/],
    ['secondary', /bg-gray-700/],
    ['danger', /bg-rose-500/],
    ['ghost', /bg-transparent/],
  ] as const)('variant=%s applies expected style class', (variant, pattern) => {
    render(<Button variant={variant}>Click</Button>);
    expect(screen.getByRole('button').className).toMatch(pattern);
  });

  it.each([
    ['sm', /text-sm/],
    ['md', /text-sm/],
    ['lg', /text-base/],
  ] as const)('size=%s sets matching size class', (size, pattern) => {
    render(<Button size={size}>X</Button>);
    expect(screen.getByRole('button').className).toMatch(pattern);
  });

  it('disabled prop disables the button', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading prop disables the button and shows a spinner', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('does not fire onClick while loading', async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(<Button loading onClick={handler}>Save</Button>);
    await user.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires onClick when enabled', async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handler}>Save</Button>);
    await user.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('forwards extra className', () => {
    render(<Button className="extra-class">Save</Button>);
    expect(screen.getByRole('button').className).toMatch(/extra-class/);
  });

  it('forwards ref to the underlying button element', () => {
    const ref: { current: HTMLButtonElement | null } = { current: null };
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
