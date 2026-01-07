import { useEffect, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

/**
 * Hook to manage keyboard shortcuts for accessibility and power users
 *
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'g',
 *       ctrl: true,
 *       callback: handleGenerate,
 *       description: 'Generate image'
 *     },
 *     {
 *       key: 'h',
 *       ctrl: true,
 *       callback: toggleHistory,
 *       description: 'Toggle chat history'
 *     }
 *   ]
 * });
 */
export const useKeyboardShortcuts = ({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape key even in inputs (to blur/close)
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        console.log('[Keyboard] Shortcut triggered:', matchingShortcut.description);
        matchingShortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Log registered shortcuts in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[Keyboard] Registered shortcuts:',
        shortcuts.map((s) => ({
          combo: `${s.ctrl ? 'Ctrl+' : ''}${s.shift ? 'Shift+' : ''}${s.alt ? 'Alt+' : ''}${s.key}`,
          description: s.description,
        })),
      );
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, shortcuts]);
};

/**
 * Get a formatted string for displaying a keyboard shortcut
 *
 * @example
 * formatShortcut({ key: 'g', ctrl: true }) // Returns "Ctrl+G" (or "⌘G" on Mac)
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};

/**
 * Hook to manage keyboard shortcuts modal state
 * Returns modal state and shortcuts array
 */
export const useKeyboardShortcutsModal = (): {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
} => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    toggleModal: () => setIsModalOpen((prev) => !prev),
  };
};

/**
 * Default shortcuts for the app
 */
export const getDefaultShortcuts = (handlers: {
  onGenerate?: () => void;
  onToggleHistory?: () => void;
  onClosePanels?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenSettings?: () => void;
  onSave?: () => void;
  onSwitchToStudio?: () => void;
  onSwitchToGallery?: () => void;
  onSwitchToBrainstorm?: () => void;
  onShowShortcuts?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleSafeZones?: () => void;
  onExport?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (handlers.onGenerate) {
    shortcuts.push({
      key: 'Enter',
      ctrl: true,
      callback: handlers.onGenerate,
      description: 'Generate image',
    });
  }

  if (handlers.onToggleHistory) {
    shortcuts.push({
      key: 'h',
      ctrl: true,
      callback: handlers.onToggleHistory,
      description: 'Toggle chat history',
    });
  }

  if (handlers.onClosePanels) {
    shortcuts.push({
      key: 'Escape',
      callback: handlers.onClosePanels,
      description: 'Close panels',
    });
  }

  if (handlers.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      callback: handlers.onUndo,
      description: 'Undo',
    });
  }

  if (handlers.onRedo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: true,
      callback: handlers.onRedo,
      description: 'Redo',
    });
  }

  if (handlers.onOpenSettings) {
    shortcuts.push({
      key: ',',
      ctrl: true,
      callback: handlers.onOpenSettings,
      description: 'Open settings',
    });
  }

  if (handlers.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      callback: handlers.onSave,
      description: 'Save project',
    });
  }

  // Tab switching shortcuts
  if (handlers.onSwitchToStudio) {
    shortcuts.push({
      key: '1',
      ctrl: true,
      callback: handlers.onSwitchToStudio,
      description: 'Switch to Studio tab',
    });
  }

  if (handlers.onSwitchToGallery) {
    shortcuts.push({
      key: '2',
      ctrl: true,
      callback: handlers.onSwitchToGallery,
      description: 'Switch to Gallery tab',
    });
  }

  if (handlers.onSwitchToBrainstorm) {
    shortcuts.push({
      key: '3',
      ctrl: true,
      callback: handlers.onSwitchToBrainstorm,
      description: 'Switch to Brainstorm tab',
    });
  }

  // Show shortcuts modal
  if (handlers.onShowShortcuts) {
    shortcuts.push({
      key: '?',
      callback: handlers.onShowShortcuts,
      description: 'Show keyboard shortcuts',
    });
  }

  // Duplicate element
  if (handlers.onDuplicate) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      callback: handlers.onDuplicate,
      description: 'Duplicate selected element',
    });
  }

  // Delete element
  if (handlers.onDelete) {
    shortcuts.push({
      key: 'Delete',
      callback: handlers.onDelete,
      description: 'Delete selected element',
    });
    shortcuts.push({
      key: 'Backspace',
      callback: handlers.onDelete,
      description: 'Delete selected element',
    });
  }

  // Zoom controls
  if (handlers.onZoomIn) {
    shortcuts.push({
      key: '+',
      ctrl: true,
      callback: handlers.onZoomIn,
      description: 'Zoom in',
    });
    shortcuts.push({
      key: '=',
      ctrl: true,
      callback: handlers.onZoomIn,
      description: 'Zoom in',
    });
  }

  if (handlers.onZoomOut) {
    shortcuts.push({
      key: '-',
      ctrl: true,
      callback: handlers.onZoomOut,
      description: 'Zoom out',
    });
  }

  // Toggle safe zones
  if (handlers.onToggleSafeZones) {
    shortcuts.push({
      key: ';',
      ctrl: true,
      callback: handlers.onToggleSafeZones,
      description: 'Toggle safe zones',
    });
  }

  // Quick export
  if (handlers.onExport) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      callback: handlers.onExport,
      description: 'Export design',
    });
  }

  return shortcuts;
};
