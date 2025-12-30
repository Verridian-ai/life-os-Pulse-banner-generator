import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { BannerElement } from '../../types';
import { BANNER_WIDTH, BANNER_HEIGHT } from '../../constants';

/**
 * ElementsContext - Element management
 *
 * Handles:
 * - Elements array state
 * - Selected element tracking
 * - Add, update, delete operations
 * - Element centering
 */

// Types
export type ElementsContextType = {
  elements: BannerElement[];
  setElements: (elements: BannerElement[] | ((prev: BannerElement[]) => BannerElement[])) => void;

  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;

  // Actions
  addElement: (el: BannerElement) => void;
  updateElement: (id: string, changes: Partial<BannerElement>) => void;
  deleteElement: (id: string) => void;
  centerElement: (id: string, axis: 'horizontal' | 'vertical') => void;
};

// Context
const ElementsContext = createContext<ElementsContextType | undefined>(undefined);

// Export for testing
export { ElementsContext };

// Provider Props
type ElementsProviderProps = {
  children: ReactNode;
};

// Provider Component
export function ElementsProvider({ children }: ElementsProviderProps): React.ReactElement {
  const [elements, setElements] = useState<BannerElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Actions
  const addElement = useCallback((el: BannerElement) => {
    setElements((prev: BannerElement[]) => [...prev, el]);
    setSelectedElementId(el.id);
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<BannerElement>) => {
    setElements((prev: BannerElement[]) =>
      prev.map((el: BannerElement) => (el.id === id ? { ...el, ...changes } : el)),
    );
  }, []);

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev: BannerElement[]) => prev.filter((el: BannerElement) => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
    },
    [selectedElementId],
  );

  const centerElement = useCallback((id: string, axis: 'horizontal' | 'vertical') => {
    setElements((prev: BannerElement[]) =>
      prev.map((el: BannerElement) => {
        if (el.id !== id) return el;

        const newPos: Partial<BannerElement> = {};
        if (axis === 'horizontal') {
          if (el.type === 'text') {
            // Approximate centering for text if no width
            newPos.x = BANNER_WIDTH / 2;
            newPos.textAlign = 'center';
          } else {
            const w = el.width || 0;
            newPos.x = (BANNER_WIDTH - w) / 2;
          }
        } else {
          const h = el.type === 'text' ? (el.fontSize || 60) * 1.2 : el.height || 0;
          newPos.y = (BANNER_HEIGHT - h) / 2;
        }
        return { ...el, ...newPos };
      }),
    );
  }, []);

  const value: ElementsContextType = {
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    addElement,
    updateElement,
    deleteElement,
    centerElement,
  };

  return <ElementsContext.Provider value={value}>{children}</ElementsContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useElements(): ElementsContextType {
  const context = useContext(ElementsContext);
  if (!context) {
    throw new Error('useElements must be used within ElementsProvider');
  }
  return context;
}
