import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
    );

    it('addToast adds a toast to the list', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('Test Message', 'info');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].message).toBe('Test Message');
        expect(result.current.toasts[0].type).toBe('info');
    });

    it('removeToast removes a toast by id', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        let id = '';
        act(() => {
            id = result.current.addToast('Test Message', 'info');
        });

        expect(result.current.toasts).toHaveLength(1);

        act(() => {
            result.current.removeToast(id);
        });

        expect(result.current.toasts).toHaveLength(0);
    });

    it('auto-dismisses toast after duration', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('Test Message', 'info', { duration: 1000 });
        });

        expect(result.current.toasts).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(1100);
        });

        expect(result.current.toasts).toHaveLength(0);
    });

    it('respects maxToasts limit', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        // Default max is 5. Add 6 toasts.
        act(() => {
            for (let i = 0; i < 6; i++) {
                result.current.addToast(`Message ${i}`, 'info');
            }
        });

        expect(result.current.toasts).toHaveLength(5);
        expect(result.current.toasts[4].message).toBe('Message 5');
        // First message should be gone (FIFO)
        expect(result.current.toasts[0].message).toBe('Message 1');
    });

    it('clearToasts removes all toasts', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('msg 1', 'info');
            result.current.addToast('msg 2', 'info');
        });

        expect(result.current.toasts).toHaveLength(2);

        act(() => {
            result.current.clearToasts();
        });

        expect(result.current.toasts).toHaveLength(0);
    });
});
