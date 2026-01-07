import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

describe('KeyboardShortcutsModal', () => {
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: 'Enter',
      ctrl: true,
      callback: vi.fn(),
      description: 'Generate image',
    },
    {
      key: '?',
      callback: vi.fn(),
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'z',
      ctrl: true,
      callback: vi.fn(),
      description: 'Undo',
    },
    {
      key: 'Escape',
      callback: vi.fn(),
      description: 'Close panels',
    },
    {
      key: '1',
      ctrl: true,
      callback: vi.fn(),
      description: 'Switch to Studio tab',
    },
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} shortcuts={mockShortcuts} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} shortcuts={mockShortcuts} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('displays shortcuts from different categories', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} shortcuts={mockShortcuts} />);

    // Generation category
    expect(screen.getByText('Generate image')).toBeInTheDocument();

    // History category
    expect(screen.getByText('Undo')).toBeInTheDocument();

    // Navigation category
    expect(screen.getByText('Switch to Studio tab')).toBeInTheDocument();

    // UI Controls category
    expect(screen.getByText('Close panels')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />);

    const closeButton = screen.getByLabelText('Close shortcuts modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />);

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />);

    const modalContent = screen.getByText('Keyboard Shortcuts').closest('div')?.parentElement;
    if (modalContent) {
      fireEvent.click(modalContent);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes modal when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} shortcuts={mockShortcuts} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} shortcuts={mockShortcuts} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-modal-title');
  });

  it('organizes shortcuts into categories', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} shortcuts={mockShortcuts} />);

    // Check for category headers
    expect(screen.getByText('Generation')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });
});
