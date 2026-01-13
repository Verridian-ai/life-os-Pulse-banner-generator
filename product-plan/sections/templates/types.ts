// Templates Section Types
// Based on nanobanna-pro BannerTemplate

export interface BannerElement {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  backgroundColor?: string;
  backgroundPadding?: number;
  opacity?: number;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  textStrokeStyle?: 'solid' | 'dashed' | 'dotted';
  locked?: boolean;
}

export interface BannerTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  backgroundUrl: string;
  thumbnailUrl: string;
  prompt: string;
  elements: Partial<BannerElement>[];
}

export interface TemplateFilters {
  search: string;
  industry: string | null;
}

export interface TemplatesData {
  templates: BannerTemplate[];
  industries: string[];
}
