/**
 * Platform-Specific Studios
 *
 * Export all platform studio components and configuration
 */

// Platform Studios
export { LinkedInStudio } from './LinkedInStudio';
export { YouTubeStudio } from './YouTubeStudio';
export { InstagramStudio } from './InstagramStudio';
export { FacebookStudio } from './FacebookStudio';
export { TikTokStudio } from './TikTokStudio';
export { XStudio } from './XStudio';

// Shared Components
export { StudioCanvas } from './shared/StudioCanvas';
export { PlatformFormatSelector } from './shared/PlatformFormatSelector';

// Configuration
export {
  PLATFORM_CONFIGS,
  getPlatformConfig,
  shouldShowProfileOverlay,
} from './config/platformConfig';
export type {
  PlatformType,
  PlatformStudioConfig,
  ProfileOverlayConfig,
  PublishButtonConfig,
} from './config/platformConfig';
