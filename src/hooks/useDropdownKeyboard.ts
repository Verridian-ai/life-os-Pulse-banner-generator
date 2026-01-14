import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for dropdown keyboard navigation
 * Implements WCAG 2.1 keyboard navigation patterns for menus
 */
export function useDropdownKeyboard(
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  menuItemCount: number,
  onSelectItem: (index: number) => void,
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Update focus when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Reset focus when menu closes
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        // When menu is closed, Enter/Space opens it
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0); // Set focus to first item immediately on open
        }
        return;
      }

      // Menu is open - handle navigation
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((current) => (current + 1) % menuItemCount);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((current) => (current - 1 + menuItemCount) % menuItemCount);
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setFocusedIndex(menuItemCount - 1);
          break;

        case 'Tab':
          // Trap focus within dropdown menu
          e.preventDefault();
          if (e.shiftKey) {
            // Shift+Tab: move to previous item, wrap to last
            setFocusedIndex((current) => (current - 1 + menuItemCount) % menuItemCount);
          } else {
            // Tab: move to next item, wrap to first
            setFocusedIndex((current) => (current + 1) % menuItemCount);
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0) {
            onSelectItem(focusedIndex);
          }
          break;
      }
    },
    [isOpen, focusedIndex, menuItemCount, setIsOpen, onSelectItem],
  );

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  return {
    focusedIndex,
    handleKeyDown,
    menuRef,
    buttonRef,
    itemRefs,
  };
}
