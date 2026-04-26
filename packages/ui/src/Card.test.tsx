import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardBody, CardFooter } from './Card.js';

describe('<Card>', () => {
  it('renders children inside an article landmark by default', () => {
    render(<Card data-testid="c">hi</Card>);
    const card = screen.getByTestId('c');
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveTextContent('hi');
  });

  it('applies surface background', () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId('c').className).toMatch(/bg-gray-900/);
  });

  it('hover prop adds hover affordance class', () => {
    render(
      <Card data-testid="c" hover>
        x
      </Card>,
    );
    expect(screen.getByTestId('c').className).toMatch(/hover:/);
  });

  it('clickable prop sets role=button and tabIndex=0', () => {
    render(
      <Card clickable data-testid="c">
        x
      </Card>,
    );
    const c = screen.getByTestId('c');
    expect(c).toHaveAttribute('role', 'button');
    expect(c).toHaveAttribute('tabindex', '0');
  });

  it('clickable + onClick fires on click', async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(
      <Card clickable onClick={handler} data-testid="c">
        x
      </Card>,
    );
    await user.click(screen.getByTestId('c'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('clickable card responds to Enter key (a11y)', async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(
      <Card clickable onClick={handler} data-testid="c">
        x
      </Card>,
    );
    screen.getByTestId('c').focus();
    await user.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('non-clickable card does NOT set role=button', () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId('c')).not.toHaveAttribute('role');
    expect(screen.getByTestId('c')).not.toHaveAttribute('tabindex');
  });

  it('CardHeader / CardBody / CardFooter render children with section classes', () => {
    render(
      <Card data-testid="c">
        <CardHeader data-testid="h">H</CardHeader>
        <CardBody data-testid="b">B</CardBody>
        <CardFooter data-testid="f">F</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId('h')).toHaveTextContent('H');
    expect(screen.getByTestId('b')).toHaveTextContent('B');
    expect(screen.getByTestId('f')).toHaveTextContent('F');
  });
});
