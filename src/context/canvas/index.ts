import React, { ReactNode } from 'react';

// Individual context exports
export { CanvasStateContext, CanvasStateProvider, useCanvasState } from './CanvasStateContext';
export type { CanvasStateContextType } from './CanvasStateContext';

export { ElementsContext, ElementsProvider, useElements } from './ElementsContext';
export type { ElementsContextType } from './ElementsContext';

export { LayerContext, LayerProvider, useLayers } from './LayerContext';
export type { LayerContextType } from './LayerContext';

export { ImageContext, ImageProvider, useImages } from './ImageContext';
export type { ImageContextType } from './ImageContext';

export { HistoryContext, HistoryProvider, useHistory } from './HistoryContext';
export type { HistoryContextType } from './HistoryContext';

// Import hooks for combined hook
import { useCanvasState, CanvasStateProvider } from './CanvasStateContext';
import { useElements, ElementsProvider } from './ElementsContext';
import { useLayers, LayerProvider } from './LayerContext';
import { useImages, ImageProvider } from './ImageContext';
import { useHistory, HistoryProvider } from './HistoryContext';

/**
 * CombinedCanvasProvider - Wraps all canvas contexts in the correct order
 *
 * Provider nesting order:
 * 1. CanvasStateProvider (no dependencies)
 * 2. ElementsProvider (no dependencies)
 * 3. LayerProvider (depends on Elements)
 * 4. HistoryProvider (depends on CanvasState)
 * 5. ImageProvider (depends on CanvasState and Elements)
 */
type CombinedCanvasProviderProps = {
  children: ReactNode;
};

export function CombinedCanvasProvider({ children }: CombinedCanvasProviderProps): React.ReactElement {
  return React.createElement(
    CanvasStateProvider,
    null,
    React.createElement(
      ElementsProvider,
      null,
      React.createElement(
        LayerProvider,
        null,
        React.createElement(
          HistoryProvider,
          null,
          React.createElement(ImageProvider, null, children),
        ),
      ),
    ),
  );
}

/**
 * Combined context type for backward compatibility
 * This matches the original CanvasContextType interface
 */
export type CombinedCanvasContextType = {
  // From CanvasStateContext
  canvasRef: ReturnType<typeof useCanvasState>['canvasRef'];
  bgImage: string | null;
  setBgImage: (img: string | null) => void;
  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;
  isProcessingImg: boolean;
  setIsProcessingImg: (isProcessing: boolean) => void;

  // From ElementsContext
  elements: ReturnType<typeof useElements>['elements'];
  setElements: ReturnType<typeof useElements>['setElements'];
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  addElement: ReturnType<typeof useElements>['addElement'];
  updateElement: ReturnType<typeof useElements>['updateElement'];
  deleteElement: ReturnType<typeof useElements>['deleteElement'];
  centerElement: ReturnType<typeof useElements>['centerElement'];

  // From LayerContext
  bringForward: ReturnType<typeof useLayers>['bringForward'];
  sendBackward: ReturnType<typeof useLayers>['sendBackward'];
  bringToFront: ReturnType<typeof useLayers>['bringToFront'];
  sendToBack: ReturnType<typeof useLayers>['sendToBack'];

  // From HistoryContext
  imageHistory: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addToHistory: (img: string) => void;

  // From ImageContext
  profilePic: string | null;
  setProfilePic: (img: string | null) => void;
  profileTransform: { x: number; y: number; scale: number };
  setProfileTransform: (val: { x: number; y: number; scale: number }) => void;
  refImages: string[];
  setRefImages: (images: string[] | ((prev: string[]) => string[])) => void;
  handleProfileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRefUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  aiSuggestions: { magicEdit: string[]; generation: string[] };
};

/**
 * useCanvas - Combined hook for backward compatibility
 *
 * This hook combines all focused contexts into a single object
 * that matches the original CanvasContext interface.
 *
 * For better performance, prefer using the individual hooks:
 * - useCanvasState() - Core canvas state
 * - useElements() - Element management
 * - useLayers() - Layer ordering
 * - useHistory() - Undo/redo
 * - useImages() - Image management
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCanvas(): CombinedCanvasContextType {
  const canvasState = useCanvasState();
  const elements = useElements();
  const layers = useLayers();
  const history = useHistory();
  const images = useImages();

  return {
    // CanvasState
    canvasRef: canvasState.canvasRef,
    bgImage: canvasState.bgImage,
    setBgImage: canvasState.setBgImage,
    showSafeZones: canvasState.showSafeZones,
    setShowSafeZones: canvasState.setShowSafeZones,
    isProcessingImg: canvasState.isProcessingImg,
    setIsProcessingImg: canvasState.setIsProcessingImg,

    // Elements
    elements: elements.elements,
    setElements: elements.setElements,
    selectedElementId: elements.selectedElementId,
    setSelectedElementId: elements.setSelectedElementId,
    addElement: elements.addElement,
    updateElement: elements.updateElement,
    deleteElement: elements.deleteElement,
    centerElement: elements.centerElement,

    // Layers
    bringForward: layers.bringForward,
    sendBackward: layers.sendBackward,
    bringToFront: layers.bringToFront,
    sendToBack: layers.sendToBack,

    // History
    imageHistory: history.imageHistory,
    historyIndex: history.historyIndex,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    addToHistory: history.addToHistory,

    // Images
    profilePic: images.profilePic,
    setProfilePic: images.setProfilePic,
    profileTransform: images.profileTransform,
    setProfileTransform: images.setProfileTransform,
    refImages: images.refImages,
    setRefImages: images.setRefImages,
    handleProfileUpload: images.handleProfileUpload,
    handleRefUpload: images.handleRefUpload,
    handleBgUpload: images.handleBgUpload,
    aiSuggestions: images.aiSuggestions,
  };
}
