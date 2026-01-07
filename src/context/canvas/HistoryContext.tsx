import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { useElements } from './ElementsContext';
import { useCanvasState } from './CanvasStateContext';
import { useCanvasSnapshots, SnapshotRecord } from '../../hooks/useCanvasSnapshots';

/**
 * HistoryContext - Undo/redo functionality & Snapshot Persistence
 *
 * Handles:
 * - Image history stack (Undo/Redo)
 * - Named Snapshots (Persistence)
 *
 * Note: Depends on CanvasStateContext and ElementsContext.
 */

// Types
export type HistoryContextType = {
  // Undo/Redo
  imageHistory: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addToHistory: (img: string) => void;

  // Snapshots
  snapshots: SnapshotRecord[];
  saveCurrentSnapshot: (name: string) => void;
  restoreSnapshot: (snapshot: SnapshotRecord) => void;
  deleteSnapshot: (id: string) => void;
  renameSnapshot: (id: string, newName: string) => void;
  updateSnapshot: (id: string) => void;
};

// Context
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Export for testing
export { HistoryContext };

// Provider Props
type HistoryProviderProps = {
  children: ReactNode;
  value?: HistoryContextType;
};

// Provider Component
export function HistoryProvider({ children, value: initialValue }: HistoryProviderProps): React.ReactElement {
  // Access sibling contexts for state management
  const { bgImage, setBgImage, canvasFormatId, setCanvasFormatId } = useCanvasState();
  const { elements, setElements } = useElements();

  // Snapshots Persistence Hook
  const {
    snapshots,
    saveSnapshot: _saveSnapshot,
    deleteSnapshot,
    renameSnapshot,
    updateSnapshot: _updateSnapshot
  } = useCanvasSnapshots();

  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Computed history flags
  const canUndo = (initialValue?.canUndo ?? historyIndex > 0);
  const canRedo = (initialValue?.canRedo ?? historyIndex < imageHistory.length - 1);

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
    if (canUndo && setBgImage) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Undo to index', newIndex);
    }
  }, [canUndo, historyIndex, imageHistory, setBgImage]);

  // Redo operation
  const redo = useCallback(() => {
    if (canRedo && setBgImage) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBgImage(imageHistory[newIndex]);
      console.log('[History] Redo to index', newIndex);
    }
  }, [canRedo, historyIndex, imageHistory, setBgImage]);

  // Snapshot Actions
  const saveCurrentSnapshot = useCallback((name: string) => {
    _saveSnapshot(name, bgImage, elements, canvasFormatId);
  }, [bgImage, elements, canvasFormatId, _saveSnapshot]);

  const restoreSnapshot = useCallback((snapshot: SnapshotRecord) => {
    setBgImage(snapshot.bgImage);
    setElements(snapshot.elements);
    // Only set format if it exists in snapshot (backward compatibility)
    if (snapshot.canvasFormatId) {
      setCanvasFormatId(snapshot.canvasFormatId);
    }
    console.log('[History] Restored snapshot:', snapshot.name);
  }, [setBgImage, setElements, setCanvasFormatId]);

  const updateSnapshot = useCallback((id: string) => {
    _updateSnapshot(id, bgImage, elements, canvasFormatId);
  }, [bgImage, elements, canvasFormatId, _updateSnapshot]);

  const value: HistoryContextType = {
    imageHistory,
    historyIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,

    // Snapshots
    snapshots,
    saveCurrentSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    renameSnapshot,
    updateSnapshot,

    ...initialValue,
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
