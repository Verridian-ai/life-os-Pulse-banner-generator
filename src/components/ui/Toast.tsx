import { useEffect, useState } from 'react';
import { useToast as useToastContext } from '@/context/ToastContext';
import type { Toast as ToastType } from '@/types';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface ToastProps {
    toast: ToastType;
    onDismiss: (id: string) => void;
}

/**
 * Get progress bar color based on toast type
 * Uses brand colors: orange/yellow for info/success, red for error
 */
function getProgressBarColor(type: ToastType['type']): string {
    switch (type) {
        case 'success':
            return 'bg-white/40';
        case 'error':
            return 'bg-white/50';
        case 'warning':
            return 'bg-black/30';
        case 'info':
        default:
            return 'bg-white/40';
    }
}

/**
 * Individual toast notification component with smooth slide-in/slide-out animations
 *
 * **Auto-Dismiss Timer with Progress Indicator:**
 * - Timer pauses on hover and resumes on mouse leave
 * - Visual progress bar shows remaining time before auto-dismiss
 * - Progress bar pauses when user hovers, creating visual feedback
 * - Allows users to read toast content without rushing
 *
 * **Glassmorphism Styling (Life OS Design System):**
 * - Frosted glass effect with backdrop-blur and saturation
 * - Respects blur budget: 20px mobile, 40px desktop (Design System Section 3.2)
 * - GPU-optimized with transform: translateZ(0)
 * - Semi-transparent backgrounds with white/10 border
 * - Dark mode compatible with automatic color adjustments
 *
 * **Accessibility:**
 * - ARIA live regions: 'assertive' for errors/warnings, 'polite' for info/success
 * - ARIA roles: 'alert' for errors/warnings, 'status' for info/success
 * - ARIA atomic: Ensures entire message is announced to screen readers
 * - Keyboard support: Interactive buttons (close, action) are keyboard accessible
 * - Focus indicators: Visible focus rings on buttons for keyboard navigation
 * - High contrast mode: Removes blur, adds solid borders
 * - Forced colors mode: Uses system colors
 * - Reduced motion: Disables animations
 * - Note: Global Escape key handling is managed by ToastContainer
 *
 * **Performance:**
 * - Uses transform animations (no bounce)
 * - Never animates backdrop-filter or box-shadow (Design System Section 7.2)
 * - GPU layer promotion for smooth rendering
 *
 * @param toast - Toast notification data
 * @param onDismiss - Callback to dismiss the toast
 */
export function Toast({ toast, onDismiss }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const isMobile = useIsMobile();
    const [isPaused, setIsPaused] = useState(false);
    const { pauseToast, resumeToast } = useToastContext();

    // Handle pause/resume with local state tracking for progress bar
    const handleMouseEnter = () => {
        setIsPaused(true);
        pauseToast(toast.id);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
        resumeToast(toast.id);
    };

    // Trigger enter animation on mount
    useEffect(() => {
        // Small delay to trigger CSS transition
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // isMobile now provided by useIsMobile hook for blur budget compliance (20px mobile, 40px desktop)

    const handleDismiss = () => {
        setIsExiting(true);
        // Wait for exit animation to complete before removing
        setTimeout(() => {
            onDismiss(toast.id);
        }, 200);
    };

    // Get icon and colors based on toast type
    const getToastConfig = () => {
        switch (toast.type) {
            case 'success':
                return {
                    icon: 'check_circle',
                    bgColor: 'bg-green-600/90 dark:bg-green-500/90',
                    textColor: 'text-white',
                    iconColor: 'text-white',
                };
            case 'error':
                return {
                    icon: 'error',
                    bgColor: 'bg-red-600/90 dark:bg-red-500/90',
                    textColor: 'text-white',
                    iconColor: 'text-white',
                };
            case 'warning':
                return {
                    icon: 'warning',
                    bgColor: 'bg-yellow-500/90 dark:bg-yellow-600/90',
                    textColor: 'text-black dark:text-white',
                    iconColor: 'text-black dark:text-white',
                };
            case 'info':
            default:
                return {
                    icon: 'info',
                    bgColor: 'bg-sky-600/90 dark:bg-sky-500/90',
                    textColor: 'text-white',
                    iconColor: 'text-white',
                };
        }
    };

    const config = getToastConfig();
    const isAlert = toast.type === 'error' || toast.type === 'warning';

    // Use rounded-2xl for longer messages to accommodate multi-line text
    const isLongMessage = toast.message.length > 50;

    const commonClasses = `
        px-4 md:px-6 py-2 md:py-3 ${isLongMessage ? 'rounded-2xl' : 'rounded-full'} shadow-2xl
        flex items-center gap-2 md:gap-3
        border border-white/10
        max-w-[90vw] w-full
        transition-[opacity,transform]
        ${isExiting ? 'duration-[200ms]' : 'duration-[300ms]'}
        ease-out
        ${config.bgColor} ${config.textColor}
        ${isExiting
            ? 'opacity-0 -translate-y-4 scale-95'
            : isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-4 scale-95'
        }
        motion-reduce:transition-none motion-reduce:transform-none
        contrast-more:border-2 contrast-more:border-current contrast-more:backdrop-blur-none contrast-more:bg-opacity-100
        forced-colors:border-2 forced-colors:border-[ButtonText] forced-colors:backdrop-blur-none forced-colors:bg-[Canvas]
        transform-gpu will-change-[opacity,transform]
        ${isMobile
            ? 'backdrop-blur-[20px] backdrop-saturate-[180%]'
            : 'backdrop-blur-[40px] backdrop-saturate-[180%]'
        }
    `;

    const progressBarColor = getProgressBarColor(toast.type);
    const showProgressBar = toast.duration > 0;

    return (
        <>
            {isAlert ? (
                <div
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={commonClasses}
                >
                    <ToastContent config={config} toast={toast} onDismiss={handleDismiss} />
                    {/* Progress bar showing remaining time - hidden for reduced motion */}
                    {showProgressBar && (
                        <div
                            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left toast-progress-bar motion-reduce:hidden ${progressBarColor}`}
                            style={{
                                animationDuration: `${toast.duration}ms`,
                                animationPlayState: isPaused ? 'paused' : 'running',
                            }}
                            aria-hidden="true"
                        />
                    )}
                </div>
            ) : (
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={commonClasses}
                >
                    <ToastContent config={config} toast={toast} onDismiss={handleDismiss} />
                    {/* Progress bar showing remaining time - hidden for reduced motion */}
                    {showProgressBar && (
                        <div
                            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left toast-progress-bar motion-reduce:hidden ${progressBarColor}`}
                            style={{
                                animationDuration: `${toast.duration}ms`,
                                animationPlayState: isPaused ? 'paused' : 'running',
                            }}
                            aria-hidden="true"
                        />
                    )}
                </div>
            )}
        </>
    );
}

interface ToastContentProps {
    config: {
        icon: string;
        bgColor: string;
        textColor: string;
        iconColor: string;
    };
    toast: ToastType;
    onDismiss: () => void;
}

/**
 * Shared content for both alert and status variations to keep the code DRY
 */
function ToastContent({ config, toast, onDismiss }: ToastContentProps) {
    return (
        <>
            {/* Icon */}
            <span className={`material-icons text-sm md:text-base ${config.iconColor} shrink-0`}>
                {config.icon}
            </span>

            {/* Message - line-clamp-2 allows 2 lines before truncating, title shows full text on hover */}
            <span
                className="text-[10px] sm:text-xs font-bold uppercase tracking-wider line-clamp-2 flex-1"
                title={toast.message}
            >
                {toast.message}
            </span>

            {/* Action Button (if provided) */}
            {toast.action && (
                <button
                    onClick={() => {
                        toast.action?.onClick();
                        onDismiss();
                    }}
                    className="ml-1 px-2 py-1 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors text-[10px] font-bold uppercase tracking-wider shrink-0"
                    aria-label={toast.action.label}
                    type="button"
                >
                    {toast.action.label}
                </button>
            )}

            {/* Close Button - 44x44px touch target per iOS HIG */}
            {toast.dismissible && (
                <button
                    onClick={onDismiss}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 active:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors shrink-0 -mr-2"
                    aria-label="Close notification"
                    type="button"
                >
                    <span className="material-icons text-sm">close</span>
                </button>
            )}
        </>
    );
}

export default Toast;
