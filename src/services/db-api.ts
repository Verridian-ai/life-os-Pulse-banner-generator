// Supabase Database Service - Direct PostgreSQL Client

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
import { supabase } from './supabase';

/**
 * Temporary placeholder for executeQuery - functions using this need migration to Supabase SDK
 */
const executeQuery = async <T>(_query: string, _params: any[] = []): Promise<T> => {
  throw new Error(
    'This feature requires database migration. Please run the schema in your Supabase SQL Editor. See database/README.md',
  );
};

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get or create user profile (called after Supabase auth)
 */
export const upsertUser = async (
  supabaseUserId: string,
  email: string,
  name?: string,
): Promise<User> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: supabaseUserId,
        email: email,
        full_name: name || null,
      },
      {
        onConflict: 'id',
      },
    )
    .select()
    .single();

  if (error) throw new Error(`Database error: ${error.message}`);
  return data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (supabaseUserId: string): Promise<User | null> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase.from('users').select('*').eq('id', supabaseUserId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null;
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

/**
 * Update user profile
 */
export const updateUser = async (
  supabaseUserId: string,
  updates: Partial<Pick<User, 'full_name' | 'avatar_url' | 'is_pro'>>,
): Promise<User> => {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [supabaseUserId];
  let paramIndex = 2;

  if (updates.full_name !== undefined) {
    fields.push(`full_name = $${paramIndex++}`);
    values.push(updates.full_name);
  }
  if (updates.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(updates.avatar_url);
  }
  if (updates.is_pro !== undefined) {
    fields.push(`is_pro = $${paramIndex++}`);
    values.push(updates.is_pro);
  }

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: User[] }>(query, values);
  return result.rows[0];
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const query = 'SELECT * FROM get_user_stats($1);';
  const result = await executeQuery<{ rows: UserStats[] }>(query, [userId]);
  return result.rows[0];
};

// ============================================================================
// DESIGN OPERATIONS
// ============================================================================

/**
 * Create a new design
 */
export const createDesign = async (userId: string, data: CreateDesignRequest): Promise<Design> => {
  const query = `
    INSERT INTO designs (
      user_id, title, description, thumbnail_url, design_url,
      canvas_data, width, height, tags, is_public
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: Design[] }>(query, [
    userId,
    data.title,
    data.description || null,
    data.thumbnail_url || null,
    data.design_url,
    JSON.stringify(data.canvas_data) || null,
    data.width || 1920,
    data.height || 568,
    data.tags || [],
    data.is_public || false,
  ]);
  return result.rows[0];
};

/**
 * Get all designs for a user
 */
export const getUserDesigns = async (userId: string): Promise<Design[]> => {
  const query = `
    SELECT * FROM designs
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await executeQuery<{ rows: Design[] }>(query, [userId]);
  return result.rows;
};

/**
 * Get a single design by ID
 */
export const getDesignById = async (designId: string): Promise<Design | null> => {
  const query = 'SELECT * FROM designs WHERE id = $1;';
  const result = await executeQuery<{ rows: Design[] }>(query, [designId]);
  return result.rows[0] || null;
};

/**
 * Update a design
 */
export const updateDesign = async (
  designId: string,
  updates: UpdateDesignRequest,
): Promise<Design> => {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [designId];
  let paramIndex = 2;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(key === 'canvas_data' ? JSON.stringify(value) : value);
    }
  });

  const query = `
    UPDATE designs
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: Design[] }>(query, values);
  return result.rows[0];
};

/**
 * Delete a design
 */
export const deleteDesign = async (designId: string): Promise<boolean> => {
  const query = 'DELETE FROM designs WHERE id = $1 RETURNING id;';
  const result = await executeQuery<{ rows: { id: string }[] }>(query, [designId]);
  return result.rows.length > 0;
};

/**
 * Get public designs (for gallery/inspiration)
 */
export const getPublicDesigns = async (limit: number = 20): Promise<Design[]> => {
  const query = `
    SELECT * FROM designs
    WHERE is_public = true
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  const result = await executeQuery<{ rows: Design[] }>(query, [limit]);
  return result.rows;
};

// ============================================================================
// BRAND PROFILE OPERATIONS
// ============================================================================

/**
 * Create a brand profile
 */
export const createBrandProfile = async (
  userId: string,
  data: CreateBrandProfileRequest,
): Promise<BrandProfile> => {
  const query = `
    INSERT INTO brand_profiles (
      user_id, name, colors, fonts, style_keywords,
      logo_url, industry, target_audience, reference_images
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: BrandProfile[] }>(query, [
    userId,
    data.name,
    JSON.stringify(data.colors),
    JSON.stringify(data.fonts) || null,
    data.style_keywords || [],
    data.logo_url || null,
    data.industry || null,
    data.target_audience || null,
    JSON.stringify(data.reference_images) || null,
  ]);
  return result.rows[0];
};

/**
 * Get all brand profiles for a user
 */
export const getUserBrandProfiles = async (userId: string): Promise<BrandProfile[]> => {
  const query = `
    SELECT * FROM brand_profiles
    WHERE user_id = $1
    ORDER BY is_active DESC, created_at DESC;
  `;
  const result = await executeQuery<{ rows: BrandProfile[] }>(query, [userId]);
  return result.rows;
};

/**
 * Get active brand profile
 */
export const getActiveBrandProfile = async (userId: string): Promise<BrandProfile | null> => {
  const query = `
    SELECT * FROM brand_profiles
    WHERE user_id = $1 AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const result = await executeQuery<{ rows: BrandProfile[] }>(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Set active brand profile
 */
export const setActiveBrandProfile = async (
  userId: string,
  profileId: string,
): Promise<boolean> => {
  // Deactivate all other profiles
  await executeQuery('UPDATE brand_profiles SET is_active = false WHERE user_id = $1;', [userId]);

  // Activate the selected profile
  const query = `
    UPDATE brand_profiles
    SET is_active = true
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await executeQuery<{ rows: { id: string }[] }>(query, [profileId, userId]);
  return result.rows.length > 0;
};

// ============================================================================
// USAGE METRICS OPERATIONS
// ============================================================================

/**
 * Record a usage metric
 */
export const recordMetric = async (
  userId: string,
  metric: Omit<UsageMetric, 'id' | 'user_id' | 'created_at'>,
): Promise<UsageMetric> => {
  const query = `
    INSERT INTO usage_metrics (
      user_id, operation_type, model_id, provider, status,
      response_time_ms, cost_usd, input_tokens, output_tokens,
      error_message, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: UsageMetric[] }>(query, [
    userId,
    metric.operation_type,
    metric.model_id,
    metric.provider,
    metric.status,
    metric.response_time_ms || null,
    metric.cost_usd,
    metric.input_tokens || null,
    metric.output_tokens || null,
    metric.error_message || null,
    JSON.stringify(metric.metadata) || null,
  ]);
  return result.rows[0];
};

/**
 * Get usage metrics for a user (with date range)
 */
export const getUserMetrics = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<UsageMetric[]> => {
  let query = 'SELECT * FROM usage_metrics WHERE user_id = $1';
  const params: (string | number | boolean | null)[] = [userId];

  if (startDate) {
    query += ' AND created_at >= $2';
    params.push(startDate.toISOString());
  }
  if (endDate) {
    query += ` AND created_at <= $${params.length + 1}`;
    params.push(endDate.toISOString());
  }

  query += ' ORDER BY created_at DESC;';
  const result = await executeQuery<{ rows: UsageMetric[] }>(query, params);
  return result.rows;
};

// ============================================================================
// REFERENCE IMAGES OPERATIONS
// ============================================================================

/**
 * Save a reference image
 */
export const saveReferenceImage = async (
  userId: string,
  data: Omit<ReferenceImage, 'id' | 'user_id' | 'created_at'>,
): Promise<ReferenceImage> => {
  const query = `
    INSERT INTO reference_images (
      user_id, file_name, file_url, file_size_bytes,
      mime_type, width, height, tags, brand_profile_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: ReferenceImage[] }>(query, [
    userId,
    data.file_name,
    data.file_url,
    data.file_size_bytes || null,
    data.mime_type || null,
    data.width || null,
    data.height || null,
    data.tags || [],
    data.brand_profile_id || null,
  ]);
  return result.rows[0];
};

/**
 * Get all reference images for a user
 */
export const getUserReferenceImages = async (userId: string): Promise<ReferenceImage[]> => {
  const query = `
    SELECT * FROM reference_images
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await executeQuery<{ rows: ReferenceImage[] }>(query, [userId]);
  return result.rows;
};

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

/**
 * Get or create user preferences
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const query = 'SELECT * FROM user_preferences WHERE user_id = $1;';
  const result = await executeQuery<{ rows: UserPreferences[] }>(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>,
): Promise<UserPreferences> => {
  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [userId];
  let paramIndex = 2;

  Object.entries(preferences).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(key === 'preferences' ? JSON.stringify(value) : value);
    }
  });

  const query = `
    INSERT INTO user_preferences (user_id, ${Object.keys(preferences).join(', ')})
    VALUES ($1, ${Object.keys(preferences)
      .map((_, i) => `$${i + 2}`)
      .join(', ')})
    ON CONFLICT (user_id)
    DO UPDATE SET ${fields.join(', ')}
    RETURNING *;
  `;
  const result = await executeQuery<{ rows: UserPreferences[] }>(query, values);
  return result.rows[0];
};
