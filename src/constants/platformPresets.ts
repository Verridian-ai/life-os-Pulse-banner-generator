/**
 * Platform Export Presets
 *
 * Defines export dimensions and configurations for different social media platforms.
 * Used by ExportPanel to export designs at platform-specific dimensions.
 */

export type PlatformId = 'linkedin' | 'youtube' | 'twitter' | 'facebook';

export interface PlatformPreset {
  id: PlatformId;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const PLATFORM_PRESETS: Record<PlatformId, PlatformPreset> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Banner',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
    description: 'Personal profile header image',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Channel Art',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'Channel banner (safe zone: 1546x423)',
  },
  twitter: {
    id: 'twitter',
    name: 'X/Twitter Header',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
    description: 'Profile header banner',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Cover',
    width: 820,
    height: 360,
    aspectRatio: '2.28:1',
    description: 'Profile cover photo',
  },
} as const;

export const DEFAULT_PLATFORM: PlatformId = 'linkedin';

// Helper function to get preset by ID
export function getPlatformPreset(id: PlatformId): PlatformPreset {
  return PLATFORM_PRESETS[id];
}

// Helper function to get all presets as array
export function getAllPlatformPresets(): PlatformPreset[] {
  return Object.values(PLATFORM_PRESETS);
}
