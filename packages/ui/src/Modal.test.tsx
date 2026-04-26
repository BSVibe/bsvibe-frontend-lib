import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal.js';

describe('<Modal>', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('does not render when open=false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="t">
        body
      </Modal>,
    );
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('renders title and body when open=true', () => {
    render(
      <Modal open onClose={() => {}} title="My Dialog">
        Hello
      </Modal>,
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('uses dialog role with aria-modal=true', () => {
    render(
      <Modal open onClose={() => {}} title="t">
        body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders an optional footer', () => {
    render(
      <Modal open onClose={() => {}} title="t" footer={<span>FOOT</span>}>
        body
      </Modal>,
    );
    expect(screen.getByText('FOOT')).toBeInTheDocument();
  });

  it('clicking the close button calls onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="t">
        body
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('pressing Escape calls onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="t">
        body
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('clicking the backdrop calls onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="t">
        body
      </Modal>,
    );
    const backdrop = screen.getByTestId('bsvibe-modal-backdrop');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('clicking inside the panel does NOT call onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="t">
        <span>inside</span>
      </Modal>,
    );
    await user.click(screen.getByText('inside'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="t">
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={() => {}} title="t">
        body
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });
});
