import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useKeyboardShortcuts,
  formatShortcut,
  getDefaultShortcuts,
  KeyboardShortcut,
} from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should register keyboard event listener on mount', () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: vi.fn(), description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove keyboard event listener on unmount', () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: vi.fn(), description: 'Generate' },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should not register listener when enabled is false', () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: vi.fn(), description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should call handler when shortcut with Ctrl is pressed', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should call handler when shortcut with Ctrl+Shift is pressed', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'z', ctrl: true, shift: true, callback: handler, description: 'Redo' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should call handler when shortcut with Alt is pressed', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', alt: true, callback: handler, description: 'Alt action' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        altKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should call handler for simple key without modifiers', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'Escape', callback: handler, description: 'Close panels' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should not call handler when key does not match', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when modifier keys do not match', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Press g without Ctrl
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not trigger shortcuts when typing in INPUT elements', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Create a mock input element as event target
    const inputElement = document.createElement('input');
    document.body.appendChild(inputElement);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: inputElement, writable: false });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(inputElement);
  });

  it('should not trigger shortcuts when typing in TEXTAREA elements', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const textareaElement = document.createElement('textarea');
    document.body.appendChild(textareaElement);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: textareaElement, writable: false });
      document.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(textareaElement);
  });

  it('should allow Escape key even when focused on INPUT elements', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'Escape', callback: handler, description: 'Close panels' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const inputElement = document.createElement('input');
    document.body.appendChild(inputElement);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', { value: inputElement, writable: false });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();

    document.body.removeChild(inputElement);
  });

  it('should prevent default behavior when shortcut matches', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    const preventDefaultSpy = vi.fn();

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy, writable: false });
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should support metaKey (Cmd) as alternative to ctrlKey', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should be case insensitive for key matching', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'G', ctrl: true, callback: handler, description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should update listener when shortcuts change', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ shortcuts }) => useKeyboardShortcuts({ shortcuts }),
      {
        initialProps: {
          shortcuts: [{ key: 'g', ctrl: true, callback: handler1, description: 'Generate' }],
        },
      },
    );

    // Trigger first shortcut
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler1).toHaveBeenCalledOnce();

    // Update shortcuts
    rerender({
      shortcuts: [{ key: 'h', ctrl: true, callback: handler2, description: 'History' }],
    });

    // Old shortcut should not trigger
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler1).toHaveBeenCalledOnce(); // Still only once

    // New shortcut should trigger
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(handler2).toHaveBeenCalledOnce();
  });

  it('should log registered shortcuts in development mode', () => {
    // Mock process.env.NODE_ENV as 'development'
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: vi.fn(), description: 'Generate' },
      { key: 'h', ctrl: true, callback: vi.fn(), description: 'History' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Check that console.log was called with registered shortcuts info
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Keyboard] Registered shortcuts:',
      expect.arrayContaining([
        expect.objectContaining({ combo: 'Ctrl+g', description: 'Generate' }),
        expect.objectContaining({ combo: 'Ctrl+h', description: 'History' }),
      ]),
    );

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not log registered shortcuts in non-development mode', () => {
    // Ensure NODE_ENV is 'test' (default for vitest)
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: vi.fn(), description: 'Generate' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Should not log registered shortcuts in test mode
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      '[Keyboard] Registered shortcuts:',
      expect.anything(),
    );

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should log when a shortcut is triggered', () => {
    const handler = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'g', ctrl: true, callback: handler, description: 'Generate image' },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'g',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('[Keyboard] Shortcut triggered:', 'Generate image');
  });
});

describe('formatShortcut', () => {
  // Save original navigator
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should format Ctrl+key shortcut for non-Mac', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'g',
      ctrl: true,
      callback: vi.fn(),
      description: 'Generate',
    };

    expect(formatShortcut(shortcut)).toBe('Ctrl+G');
  });

  it('should format Shift+key shortcut for non-Mac', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 's',
      shift: true,
      callback: vi.fn(),
      description: 'Shift+S',
    };

    expect(formatShortcut(shortcut)).toBe('Shift+S');
  });

  it('should format Alt+key shortcut for non-Mac', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'a',
      alt: true,
      callback: vi.fn(),
      description: 'Alt+A',
    };

    expect(formatShortcut(shortcut)).toBe('Alt+A');
  });

  it('should format Ctrl+Shift+key shortcut for non-Mac', () => {
    Object.defineProperty(global, 'navigator', {
      value: { platform: 'Win32' },
      writable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'z',
      ctrl: true,
      shift: true,
      callback: vi.fn(),
      description: 'Redo',
    };

    expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+Z');
  });

  it('should format simple key without modifiers', () => {
    const shortcut: KeyboardShortcut = {
      key: 'Escape',
      callback: vi.fn(),
      description: 'Close',
    };

    expect(formatShortcut(shortcut)).toBe('ESCAPE');
  });
});

describe('getDefaultShortcuts', () => {
  it('should return empty array when no handlers provided', () => {
    const shortcuts = getDefaultShortcuts({});
    expect(shortcuts).toEqual([]);
  });

  it('should include generate shortcut when onGenerate is provided', () => {
    const onGenerate = vi.fn();
    const shortcuts = getDefaultShortcuts({ onGenerate });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 'g',
      ctrl: true,
      callback: onGenerate,
      description: 'Generate image',
    });
  });

  it('should include toggle history shortcut when onToggleHistory is provided', () => {
    const onToggleHistory = vi.fn();
    const shortcuts = getDefaultShortcuts({ onToggleHistory });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 'h',
      ctrl: true,
      callback: onToggleHistory,
      description: 'Toggle chat history',
    });
  });

  it('should include close panels shortcut when onClosePanels is provided', () => {
    const onClosePanels = vi.fn();
    const shortcuts = getDefaultShortcuts({ onClosePanels });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 'Escape',
      callback: onClosePanels,
      description: 'Close panels',
    });
  });

  it('should include undo shortcut when onUndo is provided', () => {
    const onUndo = vi.fn();
    const shortcuts = getDefaultShortcuts({ onUndo });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 'z',
      ctrl: true,
      callback: onUndo,
      description: 'Undo',
    });
  });

  it('should include redo shortcut when onRedo is provided', () => {
    const onRedo = vi.fn();
    const shortcuts = getDefaultShortcuts({ onRedo });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 'z',
      ctrl: true,
      shift: true,
      callback: onRedo,
      description: 'Redo',
    });
  });

  it('should include settings shortcut when onOpenSettings is provided', () => {
    const onOpenSettings = vi.fn();
    const shortcuts = getDefaultShortcuts({ onOpenSettings });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: ',',
      ctrl: true,
      callback: onOpenSettings,
      description: 'Open settings',
    });
  });

  it('should include save shortcut when onSave is provided', () => {
    const onSave = vi.fn();
    const shortcuts = getDefaultShortcuts({ onSave });

    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0]).toEqual({
      key: 's',
      ctrl: true,
      callback: onSave,
      description: 'Save/Export',
    });
  });

  it('should include all shortcuts when all handlers are provided', () => {
    const handlers = {
      onGenerate: vi.fn(),
      onToggleHistory: vi.fn(),
      onClosePanels: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onOpenSettings: vi.fn(),
      onSave: vi.fn(),
    };

    const shortcuts = getDefaultShortcuts(handlers);

    expect(shortcuts).toHaveLength(7);
    expect(shortcuts.map((s) => s.description)).toEqual([
      'Generate image',
      'Toggle chat history',
      'Close panels',
      'Undo',
      'Redo',
      'Open settings',
      'Save/Export',
    ]);
  });
});
