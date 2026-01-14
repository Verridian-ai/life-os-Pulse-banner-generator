import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';

/**
 * ToggleSafeZonesCommand - Show/hide LinkedIn safe zones overlay
 */
export class ToggleSafeZonesCommand implements Command {
  name = 'toggle_safe_zones';

  execute(args: { show?: boolean }, context: CommandContext): ActionResult {
    const { show } = args;

    console.log('[ToggleSafeZonesCommand] Toggling safe zones:', { show });

    if (!context.canvasCallbacks.toggleSafeZones) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot toggle safe zones.',
      };
    }

    try {
      const newState = context.canvasCallbacks.toggleSafeZones(show);

      return {
        success: true,
        result: `Safe zones ${newState ? 'shown' : 'hidden'}`,
        action: 'toggle_safe_zones',
      };
    } catch (error) {
      console.error('[ToggleSafeZonesCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle safe zones',
      };
    }
  }
}

/**
 * ResetCanvasCommand - Clear canvas to default state
 */
export class ResetCanvasCommand implements Command {
  name = 'reset_canvas';

  execute(args: { keep_background?: boolean }, context: CommandContext): ActionResult {
    const { keep_background = false } = args;

    console.log('[ResetCanvasCommand] Resetting canvas:', { keep_background });

    try {
      // Clear all elements
      const elements = context.canvasCallbacks.getElements?.() || [];
      elements.forEach((el) => {
        context.canvasCallbacks.deleteElement?.(el.id);
      });

      // Clear profile picture
      if (context.canvasCallbacks.setProfilePic) {
        context.canvasCallbacks.setProfilePic(null);
      }

      // Clear background unless keeping it
      if (!keep_background) {
        context.onUpdate('', 'background');
      }

      return {
        success: true,
        result: keep_background
          ? 'Canvas cleared (background kept)'
          : 'Canvas reset to default state',
        action: 'reset_canvas',
      };
    } catch (error) {
      console.error('[ResetCanvasCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset canvas',
      };
    }
  }
}

/**
 * SetZoomCommand - Set canvas zoom level
 */
export class SetZoomCommand implements Command {
  name = 'set_zoom';

  execute(
    args: { level?: number; action?: 'in' | 'out' | 'fit' | 'reset' },
    context: CommandContext,
  ): ActionResult {
    const { level, action } = args;

    console.log('[SetZoomCommand] Setting zoom:', { level, action });

    if (!context.canvasCallbacks.setZoom) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot set zoom.',
      };
    }

    try {
      let newZoom: number;
      const currentZoom = context.canvasCallbacks.getZoom?.() || 1;

      if (action) {
        switch (action) {
          case 'in':
            newZoom = Math.min(currentZoom + 0.25, 3);
            break;
          case 'out':
            newZoom = Math.max(currentZoom - 0.25, 0.25);
            break;
          case 'fit':
            newZoom = 0.5; // Fit to view
            break;
          case 'reset':
          default:
            newZoom = 1;
        }
      } else if (level !== undefined) {
        newZoom = Math.max(0.25, Math.min(3, level));
      } else {
        newZoom = 1;
      }

      context.canvasCallbacks.setZoom(newZoom);

      return {
        success: true,
        result: `Zoom set to ${Math.round(newZoom * 100)}%`,
        action: 'set_zoom',
      };
    } catch (error) {
      console.error('[SetZoomCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set zoom',
      };
    }
  }
}

/**
 * CenterCanvasCommand - Center the canvas view
 */
export class CenterCanvasCommand implements Command {
  name = 'center_canvas';

  execute(_args: Record<string, unknown>, context: CommandContext): ActionResult {
    console.log('[CenterCanvasCommand] Centering canvas view');

    if (!context.canvasCallbacks.centerView) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot center view.',
      };
    }

    try {
      context.canvasCallbacks.centerView();

      return {
        success: true,
        result: 'Canvas view centered',
        action: 'center_canvas',
      };
    } catch (error) {
      console.error('[CenterCanvasCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to center canvas',
      };
    }
  }
}
