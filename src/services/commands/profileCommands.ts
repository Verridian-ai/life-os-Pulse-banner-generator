import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';

/**
 * SetProfilePictureCommand - Add profile picture to canvas
 */
export class SetProfilePictureCommand implements Command {
  name = 'set_profile_picture';

  execute(
    args: { image_url?: string; position?: 'left' | 'right' | 'center' },
    context: CommandContext,
  ): ActionResult {
    const { image_url, position = 'left' } = args;

    console.log('[SetProfilePictureCommand] Setting profile picture:', { image_url, position });

    if (!context.canvasCallbacks.setProfilePic) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot set profile picture.',
      };
    }

    try {
      // If image_url provided, use it; otherwise prompt for upload
      if (image_url) {
        context.canvasCallbacks.setProfilePic(image_url);
      } else {
        return {
          success: true,
          result:
            'Please upload a profile picture using the upload button, or provide an image URL.',
          action: 'set_profile_picture',
        };
      }

      // Set position based on argument
      const positions = {
        left: { x: 100, y: 198 },
        center: { x: 792, y: 198 },
        right: { x: 1484, y: 198 },
      };

      const pos = positions[position];
      if (context.canvasCallbacks.setProfileTransform) {
        context.canvasCallbacks.setProfileTransform({ x: pos.x, y: pos.y, scale: 1 });
      }

      return {
        success: true,
        result: `Profile picture set at ${position} position`,
        action: 'set_profile_picture',
      };
    } catch (error) {
      console.error('[SetProfilePictureCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set profile picture',
      };
    }
  }
}

/**
 * RemoveProfilePictureCommand - Remove profile picture from canvas
 */
export class RemoveProfilePictureCommand implements Command {
  name = 'remove_profile_picture';

  execute(_args: Record<string, unknown>, context: CommandContext): ActionResult {
    console.log('[RemoveProfilePictureCommand] Removing profile picture');

    if (!context.canvasCallbacks.setProfilePic) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot remove profile picture.',
      };
    }

    try {
      context.canvasCallbacks.setProfilePic(null);

      return {
        success: true,
        result: 'Profile picture removed',
        action: 'remove_profile_picture',
      };
    } catch (error) {
      console.error('[RemoveProfilePictureCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove profile picture',
      };
    }
  }
}

/**
 * TransformProfileCommand - Resize/reposition profile picture
 */
export class TransformProfileCommand implements Command {
  name = 'transform_profile';

  execute(
    args: { x?: number; y?: number; scale?: number; position?: 'left' | 'right' | 'center' },
    context: CommandContext,
  ): ActionResult {
    const { x, y, scale, position } = args;

    console.log('[TransformProfileCommand] Transforming profile:', { x, y, scale, position });

    if (!context.canvasCallbacks.setProfileTransform) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot transform profile picture.',
      };
    }

    try {
      // Get current transform or use defaults
      const currentTransform = context.canvasCallbacks.getProfileTransform?.() || {
        x: 100,
        y: 198,
        scale: 1,
      };

      let newTransform = { ...currentTransform };

      // Apply position preset if provided
      if (position) {
        const positions = {
          left: { x: 100, y: 198 },
          center: { x: 792, y: 198 },
          right: { x: 1484, y: 198 },
        };
        newTransform = { ...newTransform, ...positions[position] };
      }

      // Apply individual values if provided
      if (x !== undefined) newTransform.x = x;
      if (y !== undefined) newTransform.y = y;
      if (scale !== undefined) newTransform.scale = Math.max(0.1, Math.min(3, scale));

      context.canvasCallbacks.setProfileTransform(newTransform);

      return {
        success: true,
        result: `Profile picture transformed: x=${newTransform.x}, y=${newTransform.y}, scale=${newTransform.scale}`,
        action: 'transform_profile',
      };
    } catch (error) {
      console.error('[TransformProfileCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transform profile picture',
      };
    }
  }
}
