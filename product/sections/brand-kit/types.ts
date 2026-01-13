/**
 * Brand Kit Section Types
 */

export type LogoVariant = 'primary' | 'dark' | 'light' | 'icon';

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  usage: string;
}

export interface BrandTypography {
  headingFont: string;
  headingWeights: number[];
  bodyFont: string;
  bodyWeights: number[];
}

export interface BrandVoice {
  tone: string[];
  keywords: string[];
  description: string;
}

export interface BrandKit {
  id: string;
  name: string;
  tagline?: string;
  logos: {
    primary?: string;
    dark?: string;
    light?: string;
    icon?: string;
  };
  colors: BrandColor[];
  typography: BrandTypography;
  voice: BrandVoice;
  createdAt: string;
  updatedAt: string;
}

export interface BrandKitViewProps {
  brandKit: BrandKit;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBrandInfo: (info: { name: string; tagline?: string }) => void;
  onUploadLogo: (file: File, variant: LogoVariant) => void;
  onDeleteLogo: (variant: LogoVariant) => void;
  onAddColor: (color: Omit<BrandColor, 'id'>) => void;
  onUpdateColor: (colorId: string, color: Partial<BrandColor>) => void;
  onDeleteColor: (colorId: string) => void;
  onUpdateTypography: (typography: Partial<BrandTypography>) => void;
  onUpdateVoice: (voice: Partial<BrandVoice>) => void;
  onExportKit: () => void;
}
