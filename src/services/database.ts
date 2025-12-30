// Database Service - Neon PostgreSQL via Backend API
// All database operations go through the backend API endpoints

import { api } from './api';
import type {
  User,
  Design,
  BrandProfile,
  UsageMetric,
  ReferenceImage,
  UserPreferences,
  UserStats,
  CreateDesignRequest,
  UpdateDesignRequest,
  CreateBrandProfileRequest,
} from '../types/database';

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get current user profile from backend API
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<{ user: User }>('/api/user/profile');
    return response?.user || null;
  } catch (error) {
    console.error('[Database] Error fetching user:', error);
    return null;
  }
};

/**
 * Update user profile via backend API
 */
export const updateUser = async (
  updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>,
): Promise<User | null> => {
  try {
    const response = await api.put<{ user: User }>('/api/user/profile', updates);
    return response?.user || null;
  } catch (error) {
    console.error('[Database] Error updating user:', error);
    throw error;
  }
};

/**
 * Update last login timestamp via backend API
 */
export const updateLastLogin = async (): Promise<void> => {
  try {
    await api.post('/api/user/last-login', {});
  } catch (error) {
    console.error('[Database] Error updating last login:', error);
  }
};

/**
 * Get user statistics via backend API
 */
export const getUserStats = async (): Promise<UserStats | null> => {
  try {
    const response = await api.get<{ stats: UserStats }>('/api/user/stats');
    return response?.stats || null;
  } catch (error) {
    console.error('[Database] Error fetching user stats:', error);
    return null;
  }
};

// ============================================================================
// DESIGN OPERATIONS
// ============================================================================

/**
 * Create a new design via backend API
 */
export const createDesign = async (data: CreateDesignRequest): Promise<Design | null> => {
  try {
    const response = await api.post<{ design: Design }>('/api/designs', {
      title: data.title,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      design_url: data.design_url,
      canvas_data: data.canvas_data,
      width: data.width || 1920,
      height: data.height || 568,
      tags: data.tags || [],
      is_public: data.is_public || false,
    });
    return response?.design || null;
  } catch (error) {
    console.error('[Database] Error creating design:', error);
    throw error;
  }
};

/**
 * Get all designs for current user via backend API
 */
export const getUserDesigns = async (): Promise<Design[]> => {
  try {
    const response = await api.get<{ designs: Design[] }>('/api/designs');
    return response?.designs || [];
  } catch (error) {
    console.error('[Database] Error fetching designs:', error);
    return [];
  }
};

/**
 * Get a single design by ID via backend API
 */
export const getDesignById = async (designId: string): Promise<Design | null> => {
  try {
    const response = await api.get<{ design: Design }>(`/api/designs/${designId}`);
    return response?.design || null;
  } catch (error) {
    console.error('[Database] Error fetching design:', error);
    return null;
  }
};

/**
 * Update a design via backend API
 */
export const updateDesign = async (
  designId: string,
  updates: UpdateDesignRequest,
): Promise<Design | null> => {
  try {
    const response = await api.put<{ design: Design }>(`/api/designs/${designId}`, updates);
    return response?.design || null;
  } catch (error) {
    console.error('[Database] Error updating design:', error);
    throw error;
  }
};

/**
 * Delete a design via backend API
 */
export const deleteDesign = async (designId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/designs/${designId}`);
    return true;
  } catch (error) {
    console.error('[Database] Error deleting design:', error);
    return false;
  }
};

/**
 * Get public designs (for gallery/inspiration) via backend API
 */
export const getPublicDesigns = async (limit: number = 20): Promise<Design[]> => {
  try {
    const response = await api.get<{ designs: Design[] }>(`/api/designs/public?limit=${limit}`);
    return response?.designs || [];
  } catch (error) {
    console.error('[Database] Error fetching public designs:', error);
    return [];
  }
};

/**
 * Increment view count via backend API
 */
export const incrementViewCount = async (designId: string): Promise<void> => {
  try {
    await api.post(`/api/designs/${designId}/views`, {});
  } catch (error) {
    console.error('[Database] Error incrementing view count:', error);
  }
};

// ============================================================================
// BRAND PROFILE OPERATIONS
// ============================================================================

/**
 * Create a brand profile via backend API
 */
export const createBrandProfile = async (
  data: CreateBrandProfileRequest,
): Promise<BrandProfile | null> => {
  try {
    const response = await api.post<{ profile: BrandProfile }>('/api/brand-profiles', {
      name: data.name,
      colors: data.colors,
      fonts: data.fonts,
      style_keywords: data.style_keywords || [],
      logo_url: data.logo_url,
      industry: data.industry,
      target_audience: data.target_audience,
      reference_images: data.reference_images,
    });
    return response?.profile || null;
  } catch (error) {
    console.error('[Database] Error creating brand profile:', error);
    throw error;
  }
};

/**
 * Get all brand profiles for current user via backend API
 */
export const getUserBrandProfiles = async (): Promise<BrandProfile[]> => {
  try {
    const response = await api.get<{ profiles: BrandProfile[] }>('/api/brand-profiles');
    return response?.profiles || [];
  } catch (error) {
    console.error('[Database] Error fetching brand profiles:', error);
    return [];
  }
};

/**
 * Get active brand profile via backend API
 */
export const getActiveBrandProfile = async (): Promise<BrandProfile | null> => {
  try {
    const response = await api.get<{ profile: BrandProfile }>('/api/brand-profiles/active');
    return response?.profile || null;
  } catch (error) {
    console.error('[Database] Error fetching active brand profile:', error);
    return null;
  }
};

/**
 * Set active brand profile via backend API
 */
export const setActiveBrandProfile = async (profileId: string): Promise<boolean> => {
  try {
    await api.post(`/api/brand-profiles/${profileId}/activate`, {});
    return true;
  } catch (error) {
    console.error('[Database] Error setting active brand profile:', error);
    return false;
  }
};

/**
 * Update brand profile via backend API
 */
export const updateBrandProfile = async (
  profileId: string,
  updates: Partial<CreateBrandProfileRequest>,
): Promise<BrandProfile | null> => {
  try {
    const response = await api.put<{ profile: BrandProfile }>(`/api/brand-profiles/${profileId}`, updates);
    return response?.profile || null;
  } catch (error) {
    console.error('[Database] Error updating brand profile:', error);
    throw error;
  }
};

/**
 * Delete brand profile via backend API
 */
export const deleteBrandProfile = async (profileId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/brand-profiles/${profileId}`);
    return true;
  } catch (error) {
    console.error('[Database] Error deleting brand profile:', error);
    return false;
  }
};

// ============================================================================
// USAGE METRICS OPERATIONS
// ============================================================================

/**
 * Record a usage metric via backend API
 */
export const recordMetric = async (
  metric: Omit<UsageMetric, 'id' | 'user_id' | 'created_at'>,
): Promise<UsageMetric | null> => {
  try {
    const response = await api.post<{ metric: UsageMetric }>('/api/metrics', metric);
    return response?.metric || null;
  } catch (error) {
    console.error('[Database] Error recording metric:', error);
    return null;
  }
};

/**
 * Get usage metrics for current user (with date range) via backend API
 */
export const getUserMetrics = async (startDate?: Date, endDate?: Date): Promise<UsageMetric[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await api.get<{ metrics: UsageMetric[] }>(`/api/metrics?${params.toString()}`);
    return response?.metrics || [];
  } catch (error) {
    console.error('[Database] Error fetching metrics:', error);
    return [];
  }
};

// ============================================================================
// REFERENCE IMAGES OPERATIONS
// ============================================================================

/**
 * Save a reference image via backend API
 */
export const saveReferenceImage = async (
  data: Omit<ReferenceImage, 'id' | 'user_id' | 'created_at'>,
): Promise<ReferenceImage | null> => {
  try {
    const response = await api.post<{ image: ReferenceImage }>('/api/reference-images', data);
    return response?.image || null;
  } catch (error) {
    console.error('[Database] Error saving reference image:', error);
    throw error;
  }
};

/**
 * Get all reference images for current user via backend API
 */
export const getUserReferenceImages = async (): Promise<ReferenceImage[]> => {
  try {
    const response = await api.get<{ images: ReferenceImage[] }>('/api/reference-images');
    return response?.images || [];
  } catch (error) {
    console.error('[Database] Error fetching reference images:', error);
    return [];
  }
};

/**
 * Delete reference image via backend API
 */
export const deleteReferenceImage = async (imageId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/reference-images/${imageId}`);
    return true;
  } catch (error) {
    console.error('[Database] Error deleting reference image:', error);
    return false;
  }
};

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

/**
 * Get user preferences via backend API
 */
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const response = await api.get<{ preferences: UserPreferences }>('/api/user/preferences');
    return response?.preferences || null;
  } catch (error) {
    console.error('[Database] Error fetching user preferences:', error);
    return null;
  }
};

/**
 * Update user preferences (upsert) via backend API
 */
export const updateUserPreferences = async (
  preferences: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>,
): Promise<UserPreferences | null> => {
  try {
    const response = await api.put<{ preferences: UserPreferences }>('/api/user/preferences', preferences);
    return response?.preferences || null;
  } catch (error) {
    console.error('[Database] Error updating user preferences:', error);
    throw error;
  }
};

// ============================================================================
// IMAGE GALLERY OPERATIONS
// ============================================================================

/**
 * Save a generated image to the database via backend API
 */
export const createImage = async (data: {
  storage_url: string;
  file_name: string;
  prompt?: string;
  model_used?: string;
  quality?: string;
  generation_type?: 'generate' | 'edit' | 'upscale' | 'remove-bg' | 'restore' | 'face-enhance' | 'upload';
  tags?: string[];
  project_id?: string;
  file_size_bytes?: number;
}): Promise<{ id: string; storage_url: string } | null> => {
  try {
    const response = await api.post<{ image: { id: string; storage_url: string } }>('/api/images', {
      storage_url: data.storage_url,
      file_name: data.file_name,
      prompt: data.prompt,
      model_used: data.model_used,
      quality: data.quality,
      generation_type: data.generation_type || 'generate',
      tags: data.tags || [],
      project_id: data.project_id,
      file_size_bytes: data.file_size_bytes,
    });

    console.log('[Database] ✅ Image saved to database:', response?.image?.id);
    return response?.image || null;
  } catch (error) {
    console.error('[Database] Failed to save image:', error);
    throw error;
  }
};

/**
 * Get all images for current user with search and filters via backend API
 */
export const getUserImages = async (filters?: {
  searchQuery?: string;
  generationType?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  favorites?: boolean;
  limit?: number;
  offset?: number;
}): Promise<
  Array<{
    id: string;
    storage_url: string;
    prompt: string;
    model_used: string;
    quality: string;
    generation_type: string;
    tags: string[];
    created_at: string;
    is_favorite: boolean;
    file_name: string;
  }>
> => {
  try {
    const params = new URLSearchParams();
    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.generationType) params.append('type', filters.generationType);
    if (filters?.favorites) params.append('favorites', 'true');
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    params.append('limit', String(filters?.limit || 50));
    params.append('offset', String(filters?.offset || 0));

    const response = await api.get<{ images: Array<any> }>(`/api/images?${params.toString()}`);
    console.log(`[Database] Retrieved ${response?.images?.length || 0} images`);
    return response?.images || [];
  } catch (error) {
    console.error('[Database] Get images error:', error);
    return [];
  }
};

/**
 * Toggle favorite status via backend API
 */
export const toggleImageFavorite = async (imageId: string): Promise<boolean> => {
  try {
    await api.post(`/api/images/${imageId}/toggle-favorite`, {});
    console.log(`[Database] Toggled favorite for image ${imageId}`);
    return true;
  } catch (error) {
    console.error('[Database] Toggle favorite error:', error);
    return false;
  }
};

/**
 * Delete an image via backend API
 */
export const deleteImageRecord = async (imageId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/images/${imageId}`);
    console.log(`[Database] Deleted image ${imageId}`);
    return true;
  } catch (error) {
    console.error('[Database] Delete image error:', error);
    return false;
  }
};

/**
 * Search images by tags via backend API
 */
export const searchImagesByTags = async (
  tags: string[],
): Promise<
  Array<{
    id: string;
    storage_url: string;
    prompt: string;
    model_used: string;
    quality: string;
    generation_type: string;
    tags: string[];
    created_at: string;
    is_favorite: boolean;
    file_name: string;
  }>
> => {
  try {
    const params = new URLSearchParams();
    params.append('tags', tags.join(','));
    const response = await api.get<{ images: Array<any> }>(`/api/images/search?${params.toString()}`);
    return response?.images || [];
  } catch (error) {
    console.error('[Database] Search images error:', error);
    return [];
  }
};

/**
 * Update image metadata (tags, favorite, etc.) via backend API
 */
export const updateImage = async (
  imageId: string,
  updates: {
    tags?: string[];
    is_favorite?: boolean;
    prompt?: string;
  },
): Promise<boolean> => {
  try {
    await api.put(`/api/images/${imageId}`, updates);
    console.log(`[Database] Updated image ${imageId}`);
    return true;
  } catch (error) {
    console.error('[Database] Update image error:', error);
    return false;
  }
};
