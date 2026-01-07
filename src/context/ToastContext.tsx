/**
 * Toast Context - Global toast notification state management
 *
 * Provides a centralized system for managing toast notifications throughout the application.
 * Handles toast lifecycle, auto-dismiss timers, and stack size management.
 *
 * Default auto-dismiss durations (set in useToast hook):
 * - Info: 3 seconds
 * - Success: 3 seconds
 * - Warning: 5 seconds
 * - Error: 7 seconds
 *
 * Duration can be customized per toast or set to 0 to disable auto-dismiss.
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type { Toast, ToastType, ToastOptions } from '../types';

interface ToastContextType {
    // Toast state
    toasts: Toast[];

    // Toast operations
    addToast: (message: string, type: ToastType, options?: ToastOptions) => string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    removeToast: (id: string) => void;
    clearToasts: () => void;
    pauseToast: (id: string) => void;
    resumeToast: (id: string) => void;
}

interface ToastTimerData {
    startTime: number;
    remainingTime: number;
    isPaused: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
    maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    maxToasts = 5
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timerRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const timerDataRefs = useRef<Map<string, ToastTimerData>>(new Map());
    const toastCounterRef = useRef(0);

    // Generate unique toast ID
    const generateToastId = useCallback((): string => {
        toastCounterRef.current += 1;
        return `toast-${Date.now()}-${toastCounterRef.current}`;
    }, []);

    // Clear auto-dismiss timer for a toast
    const clearTimer = useCallback((id: string) => {
        const timer = timerRefs.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timerRefs.current.delete(id);
        }
        timerDataRefs.current.delete(id);
    }, []);

    // Remove a toast
    const removeToast = useCallback((id: string) => {
        clearTimer(id);
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, [clearTimer]);

    // Pause a toast's auto-dismiss timer
    const pauseToast = useCallback((id: string) => {
        const timer = timerRefs.current.get(id);
        const timerData = timerDataRefs.current.get(id);

        if (timer && timerData && !timerData.isPaused) {
            // Calculate remaining time
            const elapsed = Date.now() - timerData.startTime;
            const remaining = Math.max(0, timerData.remainingTime - elapsed);

            // Clear the current timer
            clearTimeout(timer);
            timerRefs.current.delete(id);

            // Update timer data
            timerDataRefs.current.set(id, {
                ...timerData,
                remainingTime: remaining,
                isPaused: true,
            });
        }
    }, []);

    // Resume a toast's auto-dismiss timer
    const resumeToast = useCallback((id: string) => {
        const timerData = timerDataRefs.current.get(id);

        if (timerData && timerData.isPaused && timerData.remainingTime > 0) {
            // Resume the timer with remaining time
            const timer = setTimeout(() => {
                removeToast(id);
            }, timerData.remainingTime);

            timerRefs.current.set(id, timer);

            // Update timer data
            timerDataRefs.current.set(id, {
                startTime: Date.now(),
                remainingTime: timerData.remainingTime,
                isPaused: false,
            });
        }
    }, [removeToast]);

    // Add a new toast
    const addToast = useCallback((
        message: string,
        type: ToastType,
        options?: ToastOptions
    ): string => {
        const id = generateToastId();

        const newToast: Toast = {
            id,
            message,
            type,
            duration: options?.duration ?? 0, // 0 means no auto-dismiss by default
            dismissible: options?.dismissible ?? true,
            action: options?.action,
        };

        setToasts((prevToasts) => {
            const updatedToasts = [...prevToasts, newToast];

            // Enforce maximum toast stack size
            // Remove oldest toasts if we exceed the limit
            if (updatedToasts.length > maxToasts) {
                const toastsToRemove = updatedToasts.slice(0, updatedToasts.length - maxToasts);
                toastsToRemove.forEach((toast) => {
                    clearTimer(toast.id);
                });
                return updatedToasts.slice(updatedToasts.length - maxToasts);
            }

            return updatedToasts;
        });

        // Set up auto-dismiss timer if duration > 0
        if (newToast.duration > 0) {
            const timer = setTimeout(() => {
                removeToast(id);
            }, newToast.duration);

            timerRefs.current.set(id, timer);

            // Store timer data for pause/resume functionality
            timerDataRefs.current.set(id, {
                startTime: Date.now(),
                remainingTime: newToast.duration,
                isPaused: false,
            });
        }

        return id;
    }, [generateToastId, maxToasts, clearTimer, removeToast]);

    // Convenience methods
    const success = useCallback((message: string, options?: ToastOptions) =>
        addToast(message, 'success', { duration: 3000, ...options }), [addToast]);

    const error = useCallback((message: string, options?: ToastOptions) =>
        addToast(message, 'error', { duration: 7000, ...options }), [addToast]);

    const warning = useCallback((message: string, options?: ToastOptions) =>
        addToast(message, 'warning', { duration: 5000, ...options }), [addToast]);

    const info = useCallback((message: string, options?: ToastOptions) =>
        addToast(message, 'info', { duration: 3000, ...options }), [addToast]);

    // Clear all toasts
    const clearToasts = useCallback(() => {
        // Clear all timers
        timerRefs.current.forEach((timer) => {
            clearTimeout(timer);
        });
        timerRefs.current.clear();

        // Clear all timer data
        timerDataRefs.current.clear();

        // Clear all toasts
        setToasts([]);
    }, []);

    // Cleanup effect: Clear all timers on unmount
    useEffect(() => {
        const currentTimerRefs = timerRefs.current;
        const currentTimerDataRefs = timerDataRefs.current;

        return () => {
            currentTimerRefs.forEach((timer) => {
                clearTimeout(timer);
            });
            currentTimerRefs.clear();
            currentTimerDataRefs.clear();
        };
    }, []);

    const value: ToastContextType = {
        toasts,
        addToast,
        success,
        error,
        warning,
        info,
        removeToast,
        clearToasts,
        pauseToast,
        resumeToast,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
