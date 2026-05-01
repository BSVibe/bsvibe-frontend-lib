import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';

// next/link renders a plain <a> in tests, preserving any extra props.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { SidebarBrand } from './SidebarBrand';

describe('SidebarBrand', () => {
  it('renders the brand name', () => {
    render(<SidebarBrand icon={<span data-testid="icon">i</span>} name="BSGateway" />);
    expect(screen.getByText('BSGateway')).toBeInTheDocument();
  });

  it('renders the leading icon slot', () => {
    render(<SidebarBrand icon={<span data-testid="icon">i</span>} name="BSGateway" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders the tagline when provided', () => {
    render(
      <SidebarBrand
        icon={<span>i</span>}
        name="BSGateway"
        tagline="LLM Gateway"
      />,
    );
    expect(screen.getByText('LLM Gateway')).toBeInTheDocument();
  });

  it('does NOT render a tagline node when omitted', () => {
    const { container } = render(<SidebarBrand icon={<span>i</span>} name="BSGateway" />);
    // No element with the tagline-specific class should exist.
    expect(container.querySelector('.bsvibe-sidebar-brand__tagline')).toBeNull();
  });

  it('wraps content in a <Link> with default href "/"', () => {
    render(<SidebarBrand icon={<span>i</span>} name="BSGateway" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses the provided href on the Link when given', () => {
    render(<SidebarBrand icon={<span>i</span>} name="BSGateway" href="/dashboard" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('exposes an aria-label combining name + tagline when tagline given', () => {
    render(
      <SidebarBrand
        icon={<span>i</span>}
        name="BSGateway"
        tagline="LLM Gateway"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'BSGateway, LLM Gateway');
  });

  it('exposes an aria-label of name alone when tagline omitted', () => {
    render(<SidebarBrand icon={<span>i</span>} name="BSGateway" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'BSGateway');
  });

  it('applies the accent color CSS var to the brand name element', () => {
    render(<SidebarBrand icon={<span>i</span>} name="BSGateway" />);
    const nameEl = screen.getByText('BSGateway');
    // Either inline style or a Tailwind utility that references --color-accent.
    const usesAccent =
      (nameEl.getAttribute('style') ?? '').includes('var(--color-accent)') ||
      nameEl.className.includes('var(--color-accent)');
    expect(usesAccent).toBe(true);
  });
});
