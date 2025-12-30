import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { useCanvasState } from './CanvasStateContext';

/**
 * HistoryContext - Undo/redo functionality
 *
 * Handles:
 * - Image history stack
 * - Undo/redo operations
 * - History index tracking
 *
 * Note: This context depends on CanvasStateContext for setBgImage.
 * It must be used within CanvasStateProvider.
 */

// Types
export type HistoryContextType = {
  imageHistory: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addToHistory: (img: string) => void;
};

// Context
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Export for testing
export { HistoryContext };

// Provider Props
type HistoryProviderProps = {
  children: ReactNode;
};

// Provider Component
export function HistoryProvider({ children }: HistoryProviderProps): React.ReactElement {
  const { setBgImage } = useCanvasState();

  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Computed history flags
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < imageHistory.length - 1;

  // Add image to history
  const addToHistory = useCallback(
    (img: string) => {
      setImageHistory((prev: string[]) => {
        // Remove any "future" history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new image
        newHistory.push(img);
        // Limit history to last 20 images to prevent memory issues
        if (newHistory.length > 20) {
          newHistory.shift();
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        }
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [historyIndex],
  );

  // Undo operation
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Undo to index', newIndex);
    }
  }, [canUndo, historyIndex, imageHistory, setBgImage]);

  // Redo operation
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Redo to index', newIndex);
    }
  }, [canRedo, historyIndex, imageHistory, setBgImage]);

  const value: HistoryContextType = {
    imageHistory,
    historyIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
  };

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useHistory(): HistoryContextType {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
}
