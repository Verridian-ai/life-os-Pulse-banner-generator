import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

import { BannerCanvasHandle } from '../../components/BannerCanvas';

/**
 * CanvasStateContext - Core canvas state management
 *
 * Handles:
 * - Canvas ref for imperative operations
 * - Background image state
 * - Safe zones visibility toggle
 * - Processing indicator state
 */

// Types
export type CanvasStateContextType = {
  // Refs
  canvasRef: React.RefObject<BannerCanvasHandle | null>;

  // Core Canvas State
  bgImage: string | null;
  setBgImage: (img: string | null) => void;

  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;

  isProcessingImg: boolean;
  setIsProcessingImg: (isProcessing: boolean) => void;
};

// Context
const CanvasStateContext = createContext<CanvasStateContextType | undefined>(undefined);

// Export for testing
export { CanvasStateContext };

// Provider Props
type CanvasStateProviderProps = {
  children: ReactNode;
};

// Provider Component
export function CanvasStateProvider({ children }: CanvasStateProviderProps): React.ReactElement {
  const canvasRef = useRef<BannerCanvasHandle | null>(null);

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const value: CanvasStateContextType = {
    canvasRef,
    bgImage,
    setBgImage,
    showSafeZones,
    setShowSafeZones,
    isProcessingImg,
    setIsProcessingImg,
  };

  return <CanvasStateContext.Provider value={value}>{children}</CanvasStateContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useCanvasState(): CanvasStateContextType {
  const context = useContext(CanvasStateContext);
  if (!context) {
    throw new Error('useCanvasState must be used within CanvasStateProvider');
  }
  return context;
}
