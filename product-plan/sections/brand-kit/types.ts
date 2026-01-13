// Brand Kit Section Types
// Based on nanobanna-pro BrandProfile

export interface BrandColor {
  hex: string;
  name: string;
  usage: 'primary' | 'accent' | 'background';
}

export interface BrandFont {
  name: string;
  usage: 'heading' | 'body';
}

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  colors: BrandColor[];
  fonts?: BrandFont[];
  style_keywords?: string[];
  logo_url?: string;
  industry?: string;
  target_audience?: string;
  reference_images?: string[];
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BrandKitData {
  brands: BrandProfile[];
  activeBrandId: string | null;
}

export interface CreateBrandProfileRequest {
  name: string;
  colors: BrandColor[];
  fonts?: BrandFont[];
  style_keywords?: string[];
  logo_url?: string;
  industry?: string;
  target_audience?: string;
  reference_images?: string[];
}
