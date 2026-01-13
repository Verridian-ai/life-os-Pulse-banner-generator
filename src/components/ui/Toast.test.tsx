import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from './Toast';
import { ToastProvider } from '../../context/ToastContext';
import { Toast as ToastType } from '../../types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock window.matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mockToast: ToastType = {
        id: '123',
        message: 'Test Message',
        type: 'info',
        duration: 0,
        dismissible: true,
    };
    const mockOnDismiss = vi.fn();

    const renderWithProvider = (component: React.ReactNode) => {
        return render(<ToastProvider>{component}</ToastProvider>);
    };

    it('renders message and icon', () => {
        renderWithProvider(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('calls onDismiss when close button clicked', () => {
        renderWithProvider(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
        const closeBtn = screen.getByLabelText('Close notification');
        fireEvent.click(closeBtn);

        // Fast-forward animation delay (300ms)
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockOnDismiss).toHaveBeenCalledWith('123');
    });

    it('renders action button if action is provided', () => {
        const actionToast: ToastType = {
            ...mockToast,
            action: { label: 'Retry', onClick: vi.fn() }
        };
        renderWithProvider(<Toast toast={actionToast} onDismiss={mockOnDismiss} />);
        const actionBtn = screen.getByText('Retry');
        expect(actionBtn).toBeInTheDocument();
    });

    it('calls action callback when action button clicked', () => {
        const actionMock = vi.fn();
        const actionToast: ToastType = {
            ...mockToast,
            action: { label: 'Retry', onClick: actionMock }
        };
        renderWithProvider(<Toast toast={actionToast} onDismiss={mockOnDismiss} />);
        const actionBtn = screen.getByText('Retry');
        fireEvent.click(actionBtn);

        // Action click also triggers dismiss logic in Toast.tsx (which calls onDismiss)
        // But action.onClick is called immediately? 
        // Toast.tsx: 
        // onClick={() => {
        //   toast.action?.onClick(); <--- called first
        //   handleDismiss(); <--- called second
        // }}

        expect(actionMock).toHaveBeenCalled();

        // handleDismiss has delay
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(mockOnDismiss).toHaveBeenCalledWith('123');
    });
});
