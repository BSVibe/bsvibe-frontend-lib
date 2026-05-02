import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { LanguageToggle } from './LanguageToggle';

const OPTIONS = [
  { value: 'ko', label: 'KO' },
  { value: 'en', label: 'EN' },
] as const;

describe('LanguageToggle (dropdown)', () => {
  it('renders a single trigger button (not one per option)', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    // Only the trigger is in the document before opening.
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });

  it('trigger label reflects the current value', () => {
    const { rerender } = render(
      <LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />,
    );
    expect(screen.getByRole('button')).toHaveTextContent('KO');
    rerender(<LanguageToggle value="en" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('EN');
  });

  it('does NOT render the option list before the trigger is clicked', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens the listbox when the trigger is clicked', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(within(listbox).getAllByRole('option')).toHaveLength(2);
  });

  it('marks the active option with aria-selected=true', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const ko = screen.getByRole('option', { name: 'KO' });
    const en = screen.getByRole('option', { name: 'EN' });
    expect(ko).toHaveAttribute('aria-selected', 'true');
    expect(en).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange and closes when a non-active option is clicked', () => {
    const onChange = vi.fn();
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'EN' }));
    expect(onChange).toHaveBeenCalledWith('en');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does NOT fire onChange when the active option is re-clicked, but still closes', () => {
    const onChange = vi.fn();
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('option', { name: 'KO' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on Escape key', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on outside click', () => {
    render(
      <div>
        <LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: /language/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('trigger has aria-haspopup=listbox + aria-expanded reflects state', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses provided ariaLabel for both trigger and listbox', () => {
    render(
      <LanguageToggle
        value="ko"
        options={OPTIONS}
        onChange={() => {}}
        ariaLabel="Language"
      />,
    );
    expect(screen.getByRole('button', { name: /Language/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox', { name: 'Language' })).toBeInTheDocument();
  });

  it('falls back to default ariaLabel when none provided', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
  });

  it('trigger meets min 44px tap target', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/min-h-\[44px\]|min-h-11/);
  });

  it('options meet min 44px tap target', () => {
    render(<LanguageToggle value="ko" options={OPTIONS} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button'));
    const ko = screen.getByRole('option', { name: 'KO' });
    expect(ko.className).toMatch(/min-h-\[44px\]|min-h-11/);
  });

  it('forwards dataTestId to the trigger', () => {
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

  it('emits per-option testids on the listbox items (after open)', () => {
    render(
      <LanguageToggle
        value="ko"
        options={OPTIONS}
        onChange={() => {}}
        dataTestId="lang-switcher"
      />,
    );
    fireEvent.click(screen.getByTestId('lang-switcher'));
    expect(screen.getByTestId('lang-switcher-ko')).toBeInTheDocument();
    expect(screen.getByTestId('lang-switcher-en')).toBeInTheDocument();
  });

  it('scales to N options without changing the trigger footprint', () => {
    const many = [
      { value: 'ko', label: 'KO' },
      { value: 'en', label: 'EN' },
      { value: 'ja', label: 'JA' },
      { value: 'zh', label: 'ZH' },
      { value: 'es', label: 'ES' },
    ];
    render(<LanguageToggle value="en" options={many} onChange={() => {}} />);
    // Still a single trigger before opening — design contract for scalability.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button')).toHaveTextContent('EN');
    fireEvent.click(screen.getByRole('button'));
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(5);
  });
});
