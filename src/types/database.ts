// Database Types - Neon PostgreSQL Schema

export interface User {
  id: string; // This matches auth.users.id
  email: string;
  full_name?: string;
  avatar_url?: string;
  credits: number;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  design_url: string;
  canvas_data?: any; // Full canvas state
  width: number;
  height: number;
  tags?: string[];
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  colors: Array<{ hex: string; name: string; usage: 'primary' | 'accent' | 'background' }>;
  fonts?: Array<{ name: string; usage: 'heading' | 'body' }>;
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

export interface UsageMetric {
  id: string;
  user_id: string;
  operation_type: string;
  model_id: string;
  provider: 'gemini' | 'openrouter' | 'replicate';
  status: 'success' | 'failure';
  response_time_ms?: number;
  cost_usd: number;
  input_tokens?: number;
  output_tokens?: number;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export interface ReferenceImage {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  tags?: string[];
  brand_profile_id?: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  default_model_provider: 'gemini' | 'openrouter';
  default_text_model?: string;
  default_image_model?: string;
  auto_model_selection: boolean;
  default_quality: 'fast' | 'balanced' | 'best';
  gemini_api_key?: string;
  openrouter_api_key?: string;
  replicate_api_key?: string;
  gcs_bucket_name?: string;
  preferences?: any;
  updated_at: string;
}

export interface UserStats {
  total_designs: number;
  total_brand_profiles: number;
  total_reference_images: number;
  total_cost_usd: number;
  total_operations: number;
}

// Request/Response types
export interface CreateDesignRequest {
  title: string;
  description?: string;
  thumbnail_url?: string;
  design_url: string;
  canvas_data?: any;
  width?: number;
  height?: number;
  tags?: string[];
  is_public?: boolean;
}

export interface UpdateDesignRequest {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  design_url?: string;
  canvas_data?: any;
  tags?: string[];
  is_public?: boolean;
}

export interface CreateBrandProfileRequest {
  name: string;
  colors: Array<{ hex: string; name: string; usage: 'primary' | 'accent' | 'background' }>;
  fonts?: Array<{ name: string; usage: 'heading' | 'body' }>;
  style_keywords?: string[];
  logo_url?: string;
  industry?: string;
  target_audience?: string;
  reference_images?: string[];
}

export interface UploadImageRequest {
  file: File;
  folder?: 'designs' | 'references' | 'avatars' | 'logos';
  tags?: string[];
}

export interface UploadImageResponse {
  url: string;
  file_name: string;
  file_size: number;
  width?: number;
  height?: number;
}
