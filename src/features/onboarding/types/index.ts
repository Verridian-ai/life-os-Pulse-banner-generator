/**
 * Onboarding Types
 *
 * Type definitions for the onboarding flow components and data.
 */

/**
 * User profile form data collected during onboarding
 */
export type ProfileFormData = {
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  industry?: string;
};

/**
 * Supported social media platforms
 */
export type PlatformType = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';

/**
 * Design template selection during onboarding
 */
export type DesignTemplate = {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  platform?: PlatformType;
};

/**
 * API Keys form data (optional step)
 */
export type ApiKeysFormData = {
  openrouterKey?: string;
  replicateKey?: string;
};
