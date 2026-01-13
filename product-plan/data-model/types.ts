/**
 * Signal Data Model Types
 * Core entity interfaces for the Signal application
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  credits: number;
  is_pro: boolean;
  onboarding_completed: boolean;
  preferred_platforms?: PlatformType[];
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_designs: number;
  total_brand_profiles: number;
  total_reference_images: number;
  total_cost_usd: number;
  total_operations: number;
}

// ============================================================================
// Platform
// ============================================================================

export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface PlatformDimensions {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface Platform {
  id: PlatformType;
  name: string;
  description: string;
  icon: string;
  logoUrl: string;
  formats: PlatformDimensions[];
  defaultFormat: string;
}

// ============================================================================
// Design & Canvas
// ============================================================================

export interface Design {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  design_url: string;
  canvas_data?: CanvasState;
  platform: PlatformType;
  width: number;
  height: number;
  tags?: string[];
  brand_id?: string;
  template_id?: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
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
  rotation?: number;
  opacity?: number;
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
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ShapeLayerData {
  shape: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
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

// ============================================================================
// Project
// ============================================================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  design_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Template
// ============================================================================

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
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

export interface BannerTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  platform: PlatformType;
  backgroundUrl: string;
  thumbnailUrl: string;
  prompt: string;
  elements: Partial<BannerElement>[];
  created_at: string;
}

// ============================================================================
// Brand
// ============================================================================

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

// ============================================================================
// Voice Session
// ============================================================================

export interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  params?: Record<string, unknown>;
  timestamp: string;
  success: boolean;
}

export interface VoiceSession {
  id: string;
  user_id: string;
  design_id?: string;
  commands: VoiceCommand[];
  started_at: string;
  ended_at?: string;
}

// ============================================================================
// AI Generation
// ============================================================================

export interface GenerationRequest {
  prompt: string;
  size: '1K' | '2K' | '4K';
  style?: string;
  brand_id?: string;
  referenceImages?: string[];
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  cost_usd: number;
  provider: 'gemini' | 'openrouter' | 'replicate';
  createdAt: string;
}

// ============================================================================
// API Configuration
// ============================================================================

export interface ApiKeyConfig {
  provider: 'gemini' | 'openrouter' | 'replicate';
  name: string;
  description: string;
  helpUrl: string;
  isConfigured: boolean;
  isRequired: boolean;
}
