import { useEffect } from 'react';
import { useToast as useToastContext } from '@/context/ToastContext';
import { Toast } from './Toast';

/**
 * Toast container component that manages toast positions and stacking
 *
 * **Positioning & Layout:**
 * - Fixed at top-center with high z-index (z-[60]) to appear above other content
 * - Responsive top positioning: top-16 (mobile) to top-20 (desktop)
 * - Vertical stacking with gap-3 for visual separation
 * - Maximum width constraint (max-w-md) to ensure readability
 * - Centered horizontally with left-1/2 -translate-x-1/2
 *
 * **Stacking Behavior:**
 * - Toasts stack vertically from top to bottom
 * - Smooth layout transitions as toasts appear/disappear
 * - Maximum of 5 toasts enforced by ToastProvider
 * - Older toasts automatically dismissed when limit reached
 *
 * **Accessibility:**
 * - Container uses pointer-events-none to allow interaction with content beneath
 * - Individual toasts have pointer-events-auto to enable interaction
 * - ARIA live regions handled by individual Toast components (not container)
 * - Each toast announces with appropriate urgency based on type
 * - Keyboard support: Escape key dismisses most recent dismissible toast
 * - Focus indicators on interactive buttons for keyboard navigation
 *
 * @returns Container div with all active toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  // Keyboard accessibility: Global Escape key listener dismisses most recent dismissible toast
  // This prevents multiple toasts from being dismissed simultaneously
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Find the most recent dismissible toast (last in array)
        const dismissibleToast = [...toasts].reverse().find((toast) => toast.dismissible);
        if (dismissibleToast) {
          event.preventDefault();
          removeToast(dismissibleToast.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts, removeToast]);

  // Don't render anything if no toasts are active
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className='
        fixed top-16 md:top-20 left-1/2 -translate-x-1/2
        z-[60]
        flex flex-col gap-3
        w-full max-w-md px-4
        pointer-events-none
        transition-all duration-300 ease-out
        motion-reduce:transition-none
      '
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className='
            pointer-events-auto
            transition-all duration-300 ease-out
            motion-reduce:transition-none
          '
        >
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
