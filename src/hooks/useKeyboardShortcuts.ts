import { useEffect } from 'react';

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
export const useKeyboardShortcuts = ({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Allow Escape key even in inputs (to blur/close)
                if (event.key !== 'Escape') {
                    return;
                }
            }

            // Find matching shortcut
            const matchingShortcut = shortcuts.find(shortcut => {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
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
            console.log('[Keyboard] Registered shortcuts:', shortcuts.map(s => ({
                combo: `${s.ctrl ? 'Ctrl+' : ''}${s.shift ? 'Shift+' : ''}${s.alt ? 'Alt+' : ''}${s.key}`,
                description: s.description
            })));
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
}): KeyboardShortcut[] => {
    const shortcuts: KeyboardShortcut[] = [];

    if (handlers.onGenerate) {
        shortcuts.push({
            key: 'g',
            ctrl: true,
            callback: handlers.onGenerate,
            description: 'Generate image'
        });
    }

    if (handlers.onToggleHistory) {
        shortcuts.push({
            key: 'h',
            ctrl: true,
            callback: handlers.onToggleHistory,
            description: 'Toggle chat history'
        });
    }

    if (handlers.onClosePanels) {
        shortcuts.push({
            key: 'Escape',
            callback: handlers.onClosePanels,
            description: 'Close panels'
        });
    }

    if (handlers.onUndo) {
        shortcuts.push({
            key: 'z',
            ctrl: true,
            callback: handlers.onUndo,
            description: 'Undo'
        });
    }

    if (handlers.onRedo) {
        shortcuts.push({
            key: 'z',
            ctrl: true,
            shift: true,
            callback: handlers.onRedo,
            description: 'Redo'
        });
    }

    if (handlers.onOpenSettings) {
        shortcuts.push({
            key: ',',
            ctrl: true,
            callback: handlers.onOpenSettings,
            description: 'Open settings'
        });
    }

    if (handlers.onSave) {
        shortcuts.push({
            key: 's',
            ctrl: true,
            callback: handlers.onSave,
            description: 'Save/Export'
        });
    }

    return shortcuts;
};
