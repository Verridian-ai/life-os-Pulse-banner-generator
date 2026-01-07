import { useToast as useToastContext } from '@/context/ToastContext';
import type { ToastOptions } from '@/types';

/**
 * Default auto-dismiss durations for different toast types (in milliseconds)
 *
 * These durations are based on UX best practices:
 * - Info/Success: Quick confirmations (3 seconds)
 * - Warning: Important notices that need more attention (5 seconds)
 * - Error: Critical messages that users need time to read and act on (7 seconds)
 *
 * Durations can be customized per toast by passing a custom duration in options.
 * Set duration to 0 to disable auto-dismiss (toast stays until manually closed).
 */
export const TOAST_DURATIONS = {
    /** Info toast default duration: 3 seconds */
    INFO: 3000,
    /** Success toast default duration: 3 seconds */
    SUCCESS: 3000,
    /** Warning toast default duration: 5 seconds */
    WARNING: 5000,
    /** Error toast default duration: 7 seconds */
    ERROR: 7000,
} as const;

/**
 * Toast notification hook with convenient helper methods
 *
 * Provides a simple API for displaying toast notifications throughout the application.
 * Must be used within a ToastProvider.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Simple usage
 * toast.success('Image saved successfully!');
 * toast.error('Failed to connect');
 *
 * // With options
 * toast.warning('Please check your input', { duration: 5000 });
 * toast.info('Loading...', { dismissible: false });
 *
 * // With action button
 * toast.error('Failed to save', {
 *   duration: 7000,
 *   action: {
 *     label: 'Retry',
 *     onClick: () => handleRetry()
 *   }
 * });
 *
 * // Custom duration (override defaults)
 * toast.info('Quick message', { duration: 1000 });
 * toast.error('Critical error', { duration: 0 }); // 0 = no auto-dismiss
 * ```
 */
export const useToast = () => {
    const context = useToastContext();

    return {
        /**
         * Display a success toast notification
         * @param message - The message to display
         * @param options - Optional configuration (duration, dismissible, action)
         */
        success: (message: string, options?: ToastOptions) => {
            return context.addToast(message, 'success', {
                duration: TOAST_DURATIONS.SUCCESS,
                ...options,
            });
        },

        /**
         * Display an error toast notification
         * @param message - The message to display
         * @param options - Optional configuration (duration, dismissible, action)
         */
        error: (message: string, options?: ToastOptions) => {
            return context.addToast(message, 'error', {
                duration: TOAST_DURATIONS.ERROR,
                ...options,
            });
        },

        /**
         * Display a warning toast notification
         * @param message - The message to display
         * @param options - Optional configuration (duration, dismissible, action)
         */
        warning: (message: string, options?: ToastOptions) => {
            return context.addToast(message, 'warning', {
                duration: TOAST_DURATIONS.WARNING,
                ...options,
            });
        },

        /**
         * Display an info toast notification
         * @param message - The message to display
         * @param options - Optional configuration (duration, dismissible, action)
         */
        info: (message: string, options?: ToastOptions) => {
            return context.addToast(message, 'info', {
                duration: TOAST_DURATIONS.INFO,
                ...options,
            });
        },

        /**
         * Generic toast method - allows specifying type directly
         * @param message - The message to display
         * @param type - Toast type (info, warning, success, error)
         * @param options - Optional configuration (duration, dismissible, action)
         */
        toast: (message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', options?: ToastOptions) => {
            const defaultDurations = {
                info: TOAST_DURATIONS.INFO,
                success: TOAST_DURATIONS.SUCCESS,
                warning: TOAST_DURATIONS.WARNING,
                error: TOAST_DURATIONS.ERROR,
            };

            return context.addToast(message, type, {
                duration: defaultDurations[type],
                ...options,
            });
        },

        /**
         * Remove a specific toast by ID
         * @param id - The toast ID to remove
         */
        remove: (id: string) => {
            context.removeToast(id);
        },

        /**
         * Clear all active toasts
         */
        clear: () => {
            context.clearToasts();
        },
    };
};
