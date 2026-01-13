/**
 * Quick Generate Section Types
 */

export type QuickStyle = 'professional' | 'creative' | 'minimal';

export type QuickMood = 'bold' | 'calm' | 'energetic' | 'elegant';

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  platform: string;
  aspectRatio: string;
  dimensions: { width: number; height: number };
  defaultStyle: QuickStyle;
  usageCount: number;
}

export interface QuickGenerateOptions {
  style: QuickStyle;
  mood: QuickMood;
  topic?: string;
  applyBrandColors: boolean;
  includeLogo: boolean;
}

export interface GeneratedVariation {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

export interface QuickGenerateViewProps {
  quickActions: QuickAction[];
  popularActions: QuickAction[];
  recentlyUsed: QuickAction[];
  selectedAction?: QuickAction;
  options: QuickGenerateOptions;
  generatedVariations: GeneratedVariation[];
  isGenerating: boolean;
  hasBrandKit: boolean;
  onSelectAction: (actionId: string) => void;
  onUpdateOptions: (updates: Partial<QuickGenerateOptions>) => void;
  onGenerate: () => void;
  onSelectVariation: (variationId: string) => void;
  onRegenerateAll: () => void;
  onSaveDesign: (variationId: string) => void;
  onOpenInStudio: (variationId: string) => void;
  onExport: (variationId: string) => void;
  onBack: () => void;
}
