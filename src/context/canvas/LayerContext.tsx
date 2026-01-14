import React, { createContext, useContext, useCallback, ReactNode } from 'react';

import { BannerElement } from '../../types';

import { ElementsContext } from './ElementsContext';

/**
 * LayerContext - Layer ordering operations
 *
 * Handles:
 * - Bring forward/backward operations
 * - Bring to front/back operations
 *
 * Note: This context depends on ElementsContext for the elements state.
 * It must be used within an ElementsProvider.
 */

// Types
export type LayerContextType = {
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
};

// Context
const LayerContext = createContext<LayerContextType | undefined>(undefined);

// Export for testing
export { LayerContext };

// Provider Props
type LayerProviderProps = {
  children: ReactNode;
  value?: LayerContextType;
};

// Provider Component
export function LayerProvider({
  children,
  value: initialValue,
}: LayerProviderProps): React.ReactElement {
  // Use useContext directly to avoid throwing and allow conditional behavior
  const elementsContext = React.useContext(ElementsContext);
  const setElements = elementsContext?.setElements;

  const bringForward = useCallback(
    (id: string) => {
      if (!setElements) return;
      setElements((prev: BannerElement[]) => {
        const index = prev.findIndex((el) => el.id === id);
        if (index === -1 || index === prev.length - 1) return prev;
        const newElements = [...prev];
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        return newElements;
      });
    },
    [setElements],
  );

  const sendBackward = useCallback(
    (id: string) => {
      if (!setElements) return;
      setElements((prev: BannerElement[]) => {
        const index = prev.findIndex((el) => el.id === id);
        if (index <= 0) return prev;
        const newElements = [...prev];
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        return newElements;
      });
    },
    [setElements],
  );

  const bringToFront = useCallback(
    (id: string) => {
      if (!setElements) return;
      setElements((prev: BannerElement[]) => {
        const index = prev.findIndex((el) => el.id === id);
        if (index === -1 || index === prev.length - 1) return prev;
        const element = prev[index];
        const newElements = prev.filter((el) => el.id !== id);
        newElements.push(element);
        return newElements;
      });
    },
    [setElements],
  );

  const sendToBack = useCallback(
    (id: string) => {
      if (!setElements) return;
      setElements((prev: BannerElement[]) => {
        const index = prev.findIndex((el) => el.id === id);
        if (index <= 0) return prev;
        const element = prev[index];
        const newElements = prev.filter((el) => el.id !== id);
        newElements.unshift(element);
        return newElements;
      });
    },
    [setElements],
  );

  const value: LayerContextType = {
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    ...initialValue,
  };

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useLayers(): LayerContextType {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayers must be used within LayerProvider');
  }
  return context;
}
