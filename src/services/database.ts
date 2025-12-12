// Database Service - Supabase PostgreSQL Client

import { supabase as supabaseClient } from './auth';
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

/**
 * Get Supabase client or return null if not configured
 */
const getSupabase = () => {
  if (!supabaseClient) {
    console.warn('Supabase not configured - database operations disabled');
    return null;
  }
  return supabaseClient;
};

// Create a proxy that we can use throughout the file
const supabase = new Proxy({} as NonNullable<typeof supabaseClient>, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client[prop as keyof typeof client];
  }
});

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!getSupabase()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

/**
 * Update user profile
 */
export const updateUser = async (
  updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<UserStats | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_user_stats', { p_user_id: user.id });

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
};

// ============================================================================
// DESIGN OPERATIONS
// ============================================================================

/**
 * Create a new design
 */
export const createDesign = async (
  data: CreateDesignRequest
): Promise<Design | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: design, error } = await supabase
    .from('designs')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      thumbnail_url: data.thumbnail_url,
      design_url: data.design_url,
      canvas_data: data.canvas_data,
      width: data.width || 1920,
      height: data.height || 568,
      tags: data.tags || [],
      is_public: data.is_public || false,
    })
    .select()
    .single();

  if (error) throw error;
  return design;
};

/**
 * Get all designs for current user
 */
export const getUserDesigns = async (): Promise<Design[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching designs:', error);
    return [];
  }

  return data || [];
};

/**
 * Get a single design by ID
 */
export const getDesignById = async (designId: string): Promise<Design | null> => {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('id', designId)
    .single();

  if (error) {
    console.error('Error fetching design:', error);
    return null;
  }

  return data;
};

/**
 * Update a design
 */
export const updateDesign = async (
  designId: string,
  updates: UpdateDesignRequest
): Promise<Design | null> => {
  const { data, error } = await supabase
    .from('designs')
    .update(updates)
    .eq('id', designId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a design
 */
export const deleteDesign = async (designId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', designId);

  return !error;
};

/**
 * Get public designs (for gallery/inspiration)
 */
export const getPublicDesigns = async (limit: number = 20): Promise<Design[]> => {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching public designs:', error);
    return [];
  }

  return data || [];
};

/**
 * Increment view count
 */
export const incrementViewCount = async (designId: string): Promise<void> => {
  await supabase.rpc('increment_view_count', { design_id: designId });
};

// ============================================================================
// BRAND PROFILE OPERATIONS
// ============================================================================

/**
 * Create a brand profile
 */
export const createBrandProfile = async (
  data: CreateBrandProfileRequest
): Promise<BrandProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile, error } = await supabase
    .from('brand_profiles')
    .insert({
      user_id: user.id,
      name: data.name,
      colors: data.colors,
      fonts: data.fonts,
      style_keywords: data.style_keywords || [],
      logo_url: data.logo_url,
      industry: data.industry,
      target_audience: data.target_audience,
      reference_images: data.reference_images,
    })
    .select()
    .single();

  if (error) throw error;
  return profile;
};

/**
 * Get all brand profiles for current user
 */
export const getUserBrandProfiles = async (): Promise<BrandProfile[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brand profiles:', error);
    return [];
  }

  return data || [];
};

/**
 * Get active brand profile
 */
export const getActiveBrandProfile = async (): Promise<BrandProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
};

/**
 * Set active brand profile
 */
export const setActiveBrandProfile = async (profileId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Deactivate all other profiles
  await supabase
    .from('brand_profiles')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Activate the selected profile
  const { error } = await supabase
    .from('brand_profiles')
    .update({ is_active: true })
    .eq('id', profileId)
    .eq('user_id', user.id);

  return !error;
};

/**
 * Update brand profile
 */
export const updateBrandProfile = async (
  profileId: string,
  updates: Partial<CreateBrandProfileRequest>
): Promise<BrandProfile | null> => {
  const { data, error } = await supabase
    .from('brand_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete brand profile
 */
export const deleteBrandProfile = async (profileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('brand_profiles')
    .delete()
    .eq('id', profileId);

  return !error;
};

// ============================================================================
// USAGE METRICS OPERATIONS
// ============================================================================

/**
 * Record a usage metric
 */
export const recordMetric = async (
  metric: Omit<UsageMetric, 'id' | 'user_id' | 'created_at'>
): Promise<UsageMetric | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('usage_metrics')
    .insert({
      user_id: user.id,
      operation_type: metric.operation_type,
      model_id: metric.model_id,
      provider: metric.provider,
      status: metric.status,
      response_time_ms: metric.response_time_ms,
      cost_usd: metric.cost_usd,
      input_tokens: metric.input_tokens,
      output_tokens: metric.output_tokens,
      error_message: metric.error_message,
      metadata: metric.metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording metric:', error);
    return null;
  }

  return data;
};

/**
 * Get usage metrics for current user (with date range)
 */
export const getUserMetrics = async (
  startDate?: Date,
  endDate?: Date
): Promise<UsageMetric[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('usage_metrics')
    .select('*')
    .eq('user_id', user.id);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }

  return data || [];
};

// ============================================================================
// REFERENCE IMAGES OPERATIONS
// ============================================================================

/**
 * Save a reference image
 */
export const saveReferenceImage = async (
  data: Omit<ReferenceImage, 'id' | 'user_id' | 'created_at'>
): Promise<ReferenceImage | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: image, error } = await supabase
    .from('reference_images')
    .insert({
      user_id: user.id,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size_bytes: data.file_size_bytes,
      mime_type: data.mime_type,
      width: data.width,
      height: data.height,
      tags: data.tags || [],
      brand_profile_id: data.brand_profile_id,
    })
    .select()
    .single();

  if (error) throw error;
  return image;
};

/**
 * Get all reference images for current user
 */
export const getUserReferenceImages = async (): Promise<ReferenceImage[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reference_images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reference images:', error);
    return [];
  }

  return data || [];
};

/**
 * Delete reference image
 */
export const deleteReferenceImage = async (imageId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('reference_images')
    .delete()
    .eq('id', imageId);

  return !error;
};

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

/**
 * Get user preferences
 */
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
};

/**
 * Update user preferences (upsert)
 */
export const updateUserPreferences = async (
  preferences: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>
): Promise<UserPreferences | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// IMAGE GALLERY OPERATIONS
// ============================================================================

/**
 * Save a generated image to the database
 */
export const createImage = async (data: {
  storage_url: string;
  file_name: string;
  prompt?: string;
  model_used?: string;
  quality?: string;
  generation_type?: 'generate' | 'edit' | 'upscale' | 'remove-bg' | 'restore' | 'face-enhance';
  tags?: string[];
  project_id?: string;
  file_size_bytes?: number;
}): Promise<{ id: string; storage_url: string } | null> => {
  // Check if Supabase is configured
  if (!getSupabase()) {
    console.warn('[Database] Supabase not configured - cannot save image to database');
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[Database] User not authenticated - cannot save image to database');
      console.info('[Database] Images will be saved to gallery once you sign in');
      return null;
    }

    console.log('[Database] Saving image to database for user:', user.id);

    const { data: image, error } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        storage_url: data.storage_url,
        file_name: data.file_name,
        prompt: data.prompt,
        model_used: data.model_used,
        quality: data.quality,
        generation_type: data.generation_type || 'generate',
        tags: data.tags || [],
        project_id: data.project_id,
        file_size_bytes: data.file_size_bytes,
      })
      .select('id, storage_url')
      .single();

    if (error) {
      console.error('[Database] Create image error:', error);
      console.error('[Database] Error details:', error.message, error.code);
      throw error;
    }

    console.log('[Database] ✅ Image saved to database:', image.id);
    return image;
  } catch (error) {
    console.error('[Database] Failed to save image:', error);
    throw error;
  }
};

/**
 * Get all images for current user with search and filters
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
}): Promise<Array<{
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
}>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('images')
    .select('*')
    .eq('user_id', user.id);

  // Apply filters
  if (filters?.searchQuery) {
    query = query.ilike('prompt', `%${filters.searchQuery}%`);
  }

  if (filters?.generationType) {
    query = query.eq('generation_type', filters.generationType);
  }

  if (filters?.favorites) {
    query = query.eq('is_favorite', true);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 50)
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

  const { data, error } = await query;

  if (error) {
    console.error('[Database] Get images error:', error);
    return [];
  }

  console.log(`[Database] Retrieved ${data?.length || 0} images`);
  return data || [];
};

/**
 * Toggle favorite status
 */
export const toggleImageFavorite = async (imageId: string): Promise<boolean> => {
  const { data: image } = await supabase
    .from('images')
    .select('is_favorite')
    .eq('id', imageId)
    .single();

  if (!image) return false;

  const { error } = await supabase
    .from('images')
    .update({ is_favorite: !image.is_favorite })
    .eq('id', imageId);

  if (error) {
    console.error('[Database] Toggle favorite error:', error);
    return false;
  }

  console.log(`[Database] Toggled favorite for image ${imageId}`);
  return true;
};

/**
 * Delete an image
 */
export const deleteImageRecord = async (imageId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('[Database] Delete image error:', error);
    return false;
  }

  console.log(`[Database] Deleted image ${imageId}`);
  return true;
};

/**
 * Search images by tags
 */
export const searchImagesByTags = async (tags: string[]): Promise<Array<{
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
}>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('user_id', user.id)
    .contains('tags', tags)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Database] Search images error:', error);
    return [];
  }

  return data || [];
};

/**
 * Update image metadata (tags, favorite, etc.)
 */
export const updateImage = async (
  imageId: string,
  updates: {
    tags?: string[];
    is_favorite?: boolean;
    prompt?: string;
  }
): Promise<boolean> => {
  const { error } = await supabase
    .from('images')
    .update(updates)
    .eq('id', imageId);

  if (error) {
    console.error('[Database] Update image error:', error);
    return false;
  }

  console.log(`[Database] Updated image ${imageId}`);
  return true;
};
