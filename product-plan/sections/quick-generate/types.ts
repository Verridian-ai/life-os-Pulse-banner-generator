// Quick Generate Wizard Types

export interface WizardState {
  step: WizardStep;
  startingPoint: StartingPoint;
  selectedTemplate?: Template;
  prompt: string;
  enhancedPrompt?: string;
  referenceImage?: ReferenceImage;
  platform: PlatformType;
  format: CanvasFormat;
  brandProfileId?: string;
  variants: GeneratedDesign[];
  selectedVariant?: GeneratedDesign;
  isGenerating: boolean;
  error: string | null;
}

export type WizardStep =
  | 'starting-point'
  | 'description'
  | 'format'
  | 'generating'
  | 'results'
  | 'refine';

export type StartingPoint = 'fresh' | 'template';

export type PlatformType =
  | 'linkedin'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'x';

export interface CanvasFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: PlatformType;
  aspectRatio: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  platform: PlatformType;
  thumbnail: string;
  description?: string;
  tags: string[];
}

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  size: number;
}

export interface GeneratedDesign {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  platform: PlatformType;
  format: CanvasFormat;
  generatedAt: Date;
  model: string;
  seed?: number;
}

export interface ABTestResult {
  variants: GeneratedDesign[];
  winnerIndex?: number;
  metrics?: VariantMetrics[];
}

export interface VariantMetrics {
  variantId: string;
  views: number;
  clicks: number;
  selected: boolean;
}

export interface PromptEnhancement {
  original: string;
  enhanced: string;
  additions: string[];
  reasoning: string;
}
