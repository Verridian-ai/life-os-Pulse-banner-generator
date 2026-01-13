/**
 * Platform Studio Types
 * Types for the canvas-based design editor
 */

export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export type StudioTab = 'canvas' | 'templates' | 'media' | 'posts';

export interface PlatformDimensions {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  formats: PlatformDimensions[];
  defaultFormat: string;
}

export interface CanvasState {
  id: string;
  platform: PlatformType;
  format: PlatformDimensions;
  zoom: number;
  showSafeZones: boolean;
  layers: CanvasLayer[];
}

export interface CanvasLayer {
  id: string;
  type: 'image' | 'text' | 'shape' | 'background';
  name: string;
  visible: boolean;
  locked: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: ImageLayerData | TextLayerData | ShapeLayerData | BackgroundLayerData;
}

export interface ImageLayerData {
  src: string;
  alt: string;
  filters?: ImageFilters;
}

export interface TextLayerData {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ShapeLayerData {
  shape: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface BackgroundLayerData {
  type: 'solid' | 'gradient' | 'image';
  value: string;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export interface GenerationRequest {
  prompt: string;
  size: '1K' | '2K' | '4K';
  style?: string;
  referenceImages?: string[];
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

export interface StudioProps {
  platform: PlatformType;
  canvasState: CanvasState | null;
  generationHistory: GenerationResult[];
  referenceImages: ReferenceImage[];
  onGenerateImage: (request: GenerationRequest) => void;
  onSaveDesign: () => void;
  onExportDesign: (format: 'png' | 'jpg' | 'webp') => void;
  onCanvasChange: (state: CanvasState) => void;
  isGenerating: boolean;
}
