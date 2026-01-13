/**
 * Design Studio Section Types
 */

export type StudioMode = 'generate' | 'edit';

export type DesignStatus = 'draft' | 'generating' | 'completed' | 'failed';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';

export interface Platform {
  id: string;
  name: string;
  icon: string;
  aspectRatios: AspectRatio[];
}

export interface AspectRatio {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface GenerationOptions {
  platform: string;
  aspectRatio: string;
  style?: string;
  brandKitId?: string;
}

export interface Design {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  platform: string;
  aspectRatio: string;
  prompt: string;
  status: DesignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Layer {
  id: string;
  type: 'text' | 'shape' | 'image';
  name: string;
  visible: boolean;
  locked: boolean;
  properties: Record<string, unknown>;
}

export interface DesignStudioViewProps {
  mode: StudioMode;
  design?: Design;
  platforms: Platform[];
  selectedPlatform: string;
  selectedAspectRatio: string;
  layers?: Layer[];
  isGenerating: boolean;
  generationProgress?: number;
  onGenerate: (prompt: string, options: GenerationOptions) => void;
  onUpdateDesign: (updates: Partial<Design>) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onSave: () => void;
  onExport: (format: ExportFormat) => void;
  onBack: () => void;
}
