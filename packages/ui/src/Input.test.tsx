import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input.js';

describe('<Input>', () => {
  it('renders an <input> with type=text by default', () => {
    render(<Input data-testid="x" />);
    const input = screen.getByTestId('x') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text');
  });

  it.each(['email', 'password', 'text'] as const)('honors type=%s', (type) => {
    render(<Input type={type} data-testid="x" />);
    expect((screen.getByTestId('x') as HTMLInputElement).type).toBe(type);
  });

  it('renders a label associated to the input via htmlFor/id', () => {
    render(<Input label="Email" id="email-field" />);
    const label = screen.getByText('Email') as HTMLLabelElement;
    expect(label.tagName).toBe('LABEL');
    expect(label.htmlFor).toBe('email-field');
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('auto-generates an id when none supplied so the label still associates', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(<Input label="Email" helperText="we never share it" />);
    expect(screen.getByText('we never share it')).toBeInTheDocument();
  });

  it('renders error and sets aria-invalid', () => {
    render(<Input label="Email" error="must be a valid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('must be a valid email')).toBeInTheDocument();
  });

  it('error replaces helperText (no double-rendering)', () => {
    render(<Input label="Email" helperText="hint" error="bad" />);
    expect(screen.queryByText('hint')).not.toBeInTheDocument();
    expect(screen.getByText('bad')).toBeInTheDocument();
  });

  it('accepts user typing through controlled value', async () => {
    function Wrap() {
      const [v, setV] = require('react').useState('');
      return <Input data-testid="x" value={v} onChange={(e: any) => setV(e.target.value)} />;
    }
    const user = userEvent.setup();
    render(<Wrap />);
    const input = screen.getByTestId('x') as HTMLInputElement;
    await user.type(input, 'hi');
    expect(input.value).toBe('hi');
  });

  it('disabled prop disables the input', () => {
    render(<Input disabled data-testid="x" />);
    expect(screen.getByTestId('x')).toBeDisabled();
  });

  it('forwards ref to the underlying input', () => {
    const ref: { current: HTMLInputElement | null } = { current: null };
    render(<Input ref={ref} data-testid="x" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('forwards extra className to the input element', () => {
    render(<Input className="extra-class" data-testid="x" />);
    expect(screen.getByTestId('x').className).toMatch(/extra-class/);
  });

  // Phase B Batch 1 — mobile enhancements

  it('applies a 16px font-size class to avoid iOS Safari auto-zoom on focus', () => {
    render(<Input data-testid="x" />);
    // Tailwind text-base = 1rem = 16px. iOS only zooms < 16px inputs.
    expect(screen.getByTestId('x').className).toMatch(/text-base/);
  });

  it('applies a min-h-[44px] touch target (WCAG 2.5.5)', () => {
    render(<Input data-testid="x" />);
    expect(screen.getByTestId('x').className).toMatch(/min-h-\[44px\]|min-h-11/);
  });
});
