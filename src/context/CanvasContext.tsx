/**
 * CanvasContext - Backward Compatibility Re-exports
 *
 * This file maintains backward compatibility by re-exporting from the new
 * focused context structure in ./canvas/
 *
 * The CanvasContext has been split into focused, single-responsibility contexts:
 * - CanvasStateContext: Core canvas state (dimensions, zoom, pan)
 * - ElementsContext: Element management (add, remove, update, select)
 * - LayerContext: Layer ordering operations
 * - HistoryContext: Undo/redo functionality
 * - ImageContext: Image and profile management
 *
 * For better performance, prefer importing from the individual contexts:
 * - import { useCanvasState } from '@/context/canvas/CanvasStateContext';
 * - import { useElements } from '@/context/canvas/ElementsContext';
 * - import { useLayers } from '@/context/canvas/LayerContext';
 * - import { useHistory } from '@/context/canvas/HistoryContext';
 * - import { useImages } from '@/context/canvas/ImageContext';
 *
 * Or use the combined hook for full backward compatibility:
 * - import { useCanvas } from '@/context/CanvasContext';
 */

// Re-export everything from the new canvas context structure
export {
  // Combined provider and hook (backward compatibility)
  CombinedCanvasProvider as CanvasProvider,
  useCanvas,
  // Individual contexts for granular subscriptions
  CanvasStateContext,
  CanvasStateProvider,
  useCanvasState,
  ElementsContext,
  ElementsProvider,
  useElements,
  LayerContext,
  LayerProvider,
  useLayers,
  ImageContext,
  ImageProvider,
  useImages,
  HistoryContext,
  HistoryProvider,
  useHistory,
} from './canvas';

// Re-export types
export type {
  CombinedCanvasContextType,
  CanvasStateContextType,
  ElementsContextType,
  LayerContextType,
  ImageContextType,
  HistoryContextType,
} from './canvas';

// Legacy export: CanvasContext now refers to the combined context
// This is for code that imports { CanvasContext } directly
import { CanvasStateContext } from './canvas';
export { CanvasStateContext as CanvasContext };
