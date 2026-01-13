/**
 * Platform Studio Configuration
 *
 * Defines platform-specific settings for each studio wrapper:
 * - Brand colors and gradients
 * - Allowed canvas formats
 * - Publish button configuration
 * - Profile overlay settings (LinkedIn Banner only)
 */

import type { CanvasFormatId } from '@/constants';

export type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';

export interface ProfileOverlayConfig {
  show: boolean;
  size: number;
  position: { x: string; y: string };
  label: string;
  /** Shape of the profile overlay: 'circle' for LinkedIn, 'square' for Facebook */
  shape: 'circle' | 'square';
  /** CSS border-radius value: '9999px' for circle, '16px' for rounded square */
  borderRadius: string;
  /** Whether clicking the overlay should trigger profile picture upload */
  interactive: boolean;
}

export interface PublishButtonConfig {
  label: string;
  icon: string;
  enabled: boolean;
}

export interface PlatformStudioConfig {
  id: PlatformType;
  name: string;
  displayName: string;
  brandColor: string;
  brandGradient: string;
  formats: CanvasFormatId[];
  publishButton: PublishButtonConfig;
  profileOverlay: ProfileOverlayConfig;
  /** Formats that should show the profile overlay (LinkedIn Banner, Facebook Cover) */
  profileOverlayFormats: CanvasFormatId[];
  defaultFormat: CanvasFormatId;
  /** Optional default background image URL for this platform */
  defaultBackground?: string;
}

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformStudioConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    displayName: 'LinkedIn Studio',
    brandColor: '#0077B5',
    brandGradient: 'from-[#0077B5] to-[#005885]',
    formats: [
      'linkedin_portrait',
      'linkedin_carousel',
      'linkedin_post',
      'linkedin_banner',
      'linkedin_company_banner',
    ],
    publishButton: {
      label: 'Publish to LinkedIn',
      icon: 'rocket_launch',
      enabled: true,
    },
    profileOverlay: {
      show: true,
      size: 524,
      position: { x: '19.31%', y: '100%' },
      label: '524 px zone',
      shape: 'circle',
      borderRadius: '9999px',
      interactive: true,
    },
    // CRITICAL: Profile overlay ONLY shows on linkedin_banner format
    profileOverlayFormats: ['linkedin_banner'],
    defaultFormat: 'linkedin_banner',
    defaultBackground: '/assets/branding/linkedin_default.png',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    displayName: 'YouTube Studio',
    brandColor: '#FF0000',
    brandGradient: 'from-red-600 to-red-700',
    formats: [
      'youtube_shorts',
      'youtube_thumbnail',
      'youtube_banner',
      'youtube_endscreen',
    ],
    publishButton: {
      label: 'Upload to YouTube',
      icon: 'upload',
      enabled: true,
    },
    profileOverlay: {
      show: false,
      size: 0,
      position: { x: '0', y: '0' },
      label: '',
      shape: 'circle',
      borderRadius: '9999px',
      interactive: false,
    },
    profileOverlayFormats: [],
    defaultFormat: 'youtube_thumbnail',
    defaultBackground: '/assets/branding/youtube_default.png',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    displayName: 'Instagram Studio',
    brandColor: '#E4405F',
    brandGradient: 'from-pink-500 via-purple-500 to-orange-400',
    formats: [
      'instagram_reels',
      'instagram_story',
      'instagram_portrait',
      'instagram_post',
      'instagram_avatar',
    ],
    publishButton: {
      label: 'Share to Instagram',
      icon: 'share',
      enabled: true,
    },
    profileOverlay: {
      show: false,
      size: 0,
      position: { x: '0', y: '0' },
      label: '',
      shape: 'circle',
      borderRadius: '9999px',
      interactive: false,
    },
    profileOverlayFormats: [],
    defaultFormat: 'instagram_post',
    defaultBackground: '/assets/branding/instagram_default.png',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    displayName: 'Facebook Studio',
    brandColor: '#1877F2',
    brandGradient: 'from-blue-500 to-blue-600',
    formats: [
      'facebook_story',
      'facebook_post',
      'facebook_cover',
      'facebook_event',
      'facebook_group',
    ],
    publishButton: {
      label: 'Share to Facebook',
      icon: 'share',
      enabled: true,
    },
    profileOverlay: {
      show: true,
      size: 176, // 176x176 px circular profile overlay
      position: { x: '12.2%', y: '72%' }, // 16px from left, flush with bottom (centered at 227px [139+88])
      label: '176 px zone',
      shape: 'circle',
      borderRadius: '9999px', // Circular
      interactive: true, // Click to upload profile picture
    },
    // Profile overlay ONLY shows on facebook_cover format
    profileOverlayFormats: ['facebook_cover'],
    defaultFormat: 'facebook_cover', // Default to cover for FB studio
    defaultBackground: '/assets/branding/facebook_default.png',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    displayName: 'TikTok Studio',
    brandColor: '#00F2EA',
    brandGradient: 'from-pink-500 to-cyan-400',
    formats: ['tiktok_video', 'tiktok_profile'],
    publishButton: {
      label: 'Post to TikTok',
      icon: 'video_call',
      enabled: true,
    },
    profileOverlay: {
      show: false,
      size: 0,
      position: { x: '0', y: '0' },
      label: '',
      shape: 'circle',
      borderRadius: '9999px',
      interactive: false,
    },
    profileOverlayFormats: [],
    defaultFormat: 'tiktok_video',
    defaultBackground: '/assets/branding/tiktok_default.png',
  },
  x: {
    id: 'x',
    name: 'X',
    displayName: 'X Studio',
    brandColor: '#000000',
    brandGradient: 'from-gray-800 to-black',
    formats: ['x_header', 'x_post', 'x_card', 'x_profile'],
    publishButton: {
      label: 'Post to X',
      icon: 'send',
      enabled: true,
    },
    profileOverlay: {
      show: true,
      size: 400, // 400x400 px circular profile overlay (official X size)
      position: { x: '13.3%', y: '100%' }, // Bottom-left, centered at 200px from left (200/1500 * 100 = 13.3%)
      label: '400 px zone',
      shape: 'circle',
      borderRadius: '9999px',
      interactive: true,
    },
    profileOverlayFormats: ['x_header'],
    defaultFormat: 'x_header',
    defaultBackground: '/assets/branding/x_default.png',
  },
};

/**
 * Get platform config by ID
 */
export function getPlatformConfig(platformId: PlatformType): PlatformStudioConfig {
  return PLATFORM_CONFIGS[platformId];
}

/**
 * Check if profile overlay should be shown for a given platform and format
 */
export function shouldShowProfileOverlay(
  platformId: PlatformType,
  formatId: CanvasFormatId
): boolean {
  const config = PLATFORM_CONFIGS[platformId];
  return config.profileOverlayFormats.includes(formatId);
}
