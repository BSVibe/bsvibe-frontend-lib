import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders children inside <main>', () => {
    render(
      <AppShell sidebar={<nav />} header={<header />}>
        <p data-testid="content">hello</p>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    // children must be rendered inside <main>
    expect(main.contains(screen.getByTestId('content'))).toBe(true);
  });

  it('renders the sidebar slot', () => {
    render(
      <AppShell sidebar={<nav data-testid="sb" aria-label="Primary" />}>
        <p>x</p>
      </AppShell>,
    );
    expect(screen.getByTestId('sb')).toBeInTheDocument();
  });

  it('renders the header slot when provided', () => {
    render(
      <AppShell sidebar={<nav />} header={<div data-testid="hdr">hdr</div>}>
        <p>x</p>
      </AppShell>,
    );
    expect(screen.getByTestId('hdr')).toBeInTheDocument();
  });

  it('omits the header region when no header is provided', () => {
    render(
      <AppShell sidebar={<nav />}>
        <p>x</p>
      </AppShell>,
    );
    // No <header> element should be rendered.
    expect(screen.queryByRole('banner')).toBeNull();
  });

  it('applies an extra className to the root container', () => {
    const { container } = render(
      <AppShell sidebar={<nav />} className="custom-cls">
        <p>x</p>
      </AppShell>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('custom-cls');
  });
});
