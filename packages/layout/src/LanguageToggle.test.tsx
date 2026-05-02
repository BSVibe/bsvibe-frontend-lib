import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle } from './LanguageToggle';

const OPTIONS = [
  { value: 'ko', label: 'KO' },
  { value: 'en', label: 'EN' },
] as const;

describe('LanguageToggle', () => {
  it('renders one button per option', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'KO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('marks the current value with aria-pressed=true', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'KO' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the next value when a non-active button is clicked', () => {
    const onChange = vi.fn();
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('en');
  });

  it('does NOT fire onChange when the active value is re-clicked', () => {
    const onChange = vi.fn();
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'KO' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('exposes the toggle group with role and aria-label', () => {
    render(
      <LanguageToggle
        value="ko"
        options={OPTIONS}
        onChange={() => {}}
        ariaLabel="Language"
      />,
    );
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
  });

  it('falls back to a sensible default aria-label when none provided', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByRole('group', { name: /language/i })).toBeInTheDocument();
  });

  it('applies an active class to the selected option', () => {
    const { container } = render(
      <LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />,
    );
    const active = container.querySelector('.bsvibe-language-toggle__btn--active');
    expect(active).not.toBeNull();
    expect(active?.textContent).toBe('KO');
  });

  it('option buttons meet min 44px tap target (touch a11y)', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    const button = screen.getByRole('button', { name: 'KO' });
    expect(button.className).toMatch(/min-h-\[44px\]|min-h-11/);
    expect(button.className).toMatch(/min-w-\[44px\]|min-w-11/);
  });

  it('forwards dataTestId to the group container', () => {
    render(
      <LanguageToggle
        value="ko"
        options={OPTIONS}
        onChange={() => {}}
        dataTestId="lang-switcher"
      />,
    );
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
  });

  it('emits per-option testids derived from dataTestId', () => {
    render(
      <LanguageToggle
        value="ko"
        options={OPTIONS}
        onChange={() => {}}
        dataTestId="lang-switcher"
      />,
    );
    expect(screen.getByTestId('lang-switcher-ko')).toBeInTheDocument();
    expect(screen.getByTestId('lang-switcher-en')).toBeInTheDocument();
  });
});
