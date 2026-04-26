import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the title', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders rightSlot content when provided', () => {
    render(
      <Header
        title="Settings"
        rightSlot={<button data-testid="user-menu">Me</button>}
      />,
    );
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('renders without a title (banner-only layout)', () => {
    render(<Header rightSlot={<span data-testid="r">r</span>} />);
    // No heading rendered
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByTestId('r')).toBeInTheDocument();
  });

  it('sets role=banner on the outer <header>', () => {
    render(<Header title="x" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('forwards extra className to the <header>', () => {
    render(<Header title="x" className="my-cls" />);
    expect(screen.getByRole('banner').className).toContain('my-cls');
  });
});
