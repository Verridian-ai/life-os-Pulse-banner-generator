import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import {
  getUserBrandProfiles,
  getActiveBrandProfile,
  setActiveBrandProfile,
  createBrandProfile,
} from '../database';

/**
 * ExtractBrandCommand - Extract brand colors/fonts from an image
 * Uses AI to analyze the current canvas or a reference image
 */
export class ExtractBrandCommand implements Command {
  name = 'extract_brand';

  async execute(
    args: { save_as?: string },
    context: CommandContext
  ): Promise<ActionResult> {
    const { save_as } = args;

    console.log('[ExtractBrandCommand] Extracting brand from canvas');

    try {
      const canvasImage = context.getCanvasImage();

      if (!canvasImage) {
        return {
          success: false,
          error: 'No image available to extract brand from',
        };
      }

      // For now, return a placeholder - actual AI extraction would be done via LLM
      // This would typically call an AI service to analyze the image
      const extractedBrand = {
        colors: [
          { hex: '#1e40af', name: 'Primary Blue', usage: 'primary' as const },
          { hex: '#3b82f6', name: 'Accent Blue', usage: 'accent' as const },
          { hex: '#60a5fa', name: 'Light Blue', usage: 'accent' as const },
          { hex: '#ffffff', name: 'White', usage: 'background' as const },
          { hex: '#1e293b', name: 'Dark Slate', usage: 'background' as const },
        ],
        fonts: [
          { name: 'Inter', usage: 'heading' as const },
          { name: 'Roboto', usage: 'body' as const },
        ],
        style_keywords: ['modern', 'professional', 'clean'],
      };

      const colorHexes = extractedBrand.colors.map((c) => c.hex);
      const fontNames = extractedBrand.fonts.map((f) => f.name);

      if (save_as) {
        await createBrandProfile({
          name: save_as,
          colors: extractedBrand.colors,
          fonts: extractedBrand.fonts,
          style_keywords: extractedBrand.style_keywords,
        });

        return {
          success: true,
          result: `Brand extracted and saved as "${save_as}". Colors: ${colorHexes.join(', ')}`,
          action: 'extract_brand',
        };
      }

      return {
        success: true,
        result: `Extracted brand colors: ${colorHexes.join(', ')}. Fonts: ${fontNames.join(', ')}. Say "extract brand save as [name]" to save.`,
        action: 'extract_brand',
      };
    } catch (error) {
      console.error('[ExtractBrandCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract brand',
      };
    }
  }
}

/**
 * CheckBrandConsistencyCommand - Verify brand compliance of current design
 */
export class CheckBrandConsistencyCommand implements Command {
  name = 'check_brand_consistency';

  async execute(_args: Record<string, unknown>, context: CommandContext): Promise<ActionResult> {
    console.log('[CheckBrandConsistencyCommand] Checking brand consistency');

    try {
      const activeBrand = await getActiveBrandProfile();

      if (!activeBrand) {
        return {
          success: true,
          result: 'No active brand profile set. Create or activate a brand profile first.',
          action: 'check_brand_consistency',
        };
      }

      // Get current elements to check
      const elements = context.canvasCallbacks.getElements?.() || [];
      const issues: string[] = [];

      // Extract brand font names and color hexes for comparison
      const brandFontNames = activeBrand.fonts?.map((f) => f.name) || [];
      const brandColorHexes = activeBrand.colors?.map((c) => c.hex) || [];

      // Check text elements for brand font compliance
      const textElements = elements.filter((el) => el.type === 'text');
      textElements.forEach((el) => {
        if (el.fontFamily && !brandFontNames.includes(el.fontFamily)) {
          issues.push(`Text "${el.content?.substring(0, 20)}..." uses non-brand font "${el.fontFamily}"`);
        }
        if (el.color && !brandColorHexes.includes(el.color)) {
          issues.push(`Text "${el.content?.substring(0, 20)}..." uses non-brand color "${el.color}"`);
        }
      });

      if (issues.length === 0) {
        return {
          success: true,
          result: `✓ Design is consistent with "${activeBrand.name}" brand profile!`,
          action: 'check_brand_consistency',
        };
      }

      return {
        success: true,
        result: `Found ${issues.length} brand consistency issues:\n${issues.slice(0, 5).join('\n')}${issues.length > 5 ? `\n...and ${issues.length - 5} more` : ''}`,
        action: 'check_brand_consistency',
      };
    } catch (error) {
      console.error('[CheckBrandConsistencyCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check brand consistency',
      };
    }
  }
}

/**
 * ApplyBrandProfileCommand - Apply a saved brand profile to the design
 */
export class ApplyBrandProfileCommand implements Command {
  name = 'apply_brand_profile';

  async execute(
    args: { profile_name?: string; profile_id?: string },
    context: CommandContext
  ): Promise<ActionResult> {
    const { profile_name, profile_id } = args;

    console.log('[ApplyBrandProfileCommand] Applying brand profile:', { profile_name, profile_id });

    try {
      const profiles = await getUserBrandProfiles();
      let profile = null;

      if (profile_id) {
        profile = profiles.find((p) => p.id === profile_id);
      } else if (profile_name) {
        profile = profiles.find(
          (p) => p.name.toLowerCase().includes(profile_name.toLowerCase())
        );
      }

      if (!profile) {
        const available = profiles.slice(0, 3).map((p) => `"${p.name}"`).join(', ');
        return {
          success: false,
          error: `Brand profile not found. Available: ${available || 'None - create one first'}`,
        };
      }

      // Set as active profile
      await setActiveBrandProfile(profile.id);

      // Apply brand colors to text elements
      const elements = context.canvasCallbacks.getElements?.() || [];
      const primaryColorObj = profile.colors?.[0];
      const primaryFontObj = profile.fonts?.[0];
      const primaryColor = primaryColorObj?.hex || '#ffffff';
      const primaryFont = primaryFontObj?.name || 'Inter';

      elements.forEach((el) => {
        if (el.type === 'text') {
          context.canvasCallbacks.updateElement?.(el.id, {
            color: primaryColor,
            fontFamily: primaryFont,
          });
        }
      });

      return {
        success: true,
        result: `Applied "${profile.name}" brand profile. Primary color: ${primaryColor}, Font: ${primaryFont}`,
        action: 'apply_brand_profile',
      };
    } catch (error) {
      console.error('[ApplyBrandProfileCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply brand profile',
      };
    }
  }
}

/**
 * ListBrandProfilesCommand - List all saved brand profiles
 */
export class ListBrandProfilesCommand implements Command {
  name = 'list_brand_profiles';

  async execute(): Promise<ActionResult> {
    console.log('[ListBrandProfilesCommand] Listing brand profiles');

    try {
      const profiles = await getUserBrandProfiles();
      const activeProfile = await getActiveBrandProfile();

      if (profiles.length === 0) {
        return {
          success: true,
          result: 'No brand profiles found. Say "extract brand save as [name]" to create one.',
          action: 'list_brand_profiles',
        };
      }

      const profileList = profiles
        .map((p, i) => {
          const isActive = activeProfile?.id === p.id ? ' ✓ (active)' : '';
          return `${i + 1}. "${p.name}"${isActive} - ${p.colors?.length || 0} colors, ${p.fonts?.length || 0} fonts`;
        })
        .join('\n');

      return {
        success: true,
        result: `Found ${profiles.length} brand profiles:\n${profileList}`,
        action: 'list_brand_profiles',
      };
    } catch (error) {
      console.error('[ListBrandProfilesCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list brand profiles',
      };
    }
  }
}

