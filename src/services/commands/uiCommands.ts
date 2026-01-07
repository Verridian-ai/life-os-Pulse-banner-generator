import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import { Tab, StudioMode } from '@/constants';

export class NavigateToTabCommand implements Command {
  name = 'navigate_to_tab';

  execute(args: { tab: string }, context: CommandContext): ActionResult {
    const { tab } = args;

    console.log('[NavigateToTabCommand] Navigating to:', tab);

    if (!context.canvasCallbacks.setActiveTab) {
      return {
        success: false,
        error: 'Navigation not connected. Cannot change tabs.',
      };
    }

    const normalizedTab = tab.toLowerCase();
    const tabMap: Record<string, Tab> = {
      studio: Tab.STUDIO,
      canvas: Tab.STUDIO,
      gallery: Tab.STUDIO,
      media: Tab.STUDIO,
      linkedin: Tab.STUDIO,
      posts: Tab.STUDIO,
      brainstorm: Tab.BRAINSTORM,
      partner: Tab.BRAINSTORM,
    };

    const targetTab = tabMap[normalizedTab];
    if (!targetTab) {
      return {
        success: false,
        error: `Unknown tab: ${tab}. Valid tabs: studio, brainstorm`,
      };
    }

    context.canvasCallbacks.setActiveTab(targetTab);

    if (targetTab === Tab.STUDIO && context.canvasCallbacks.setStudioMode) {
      if (normalizedTab === 'gallery' || normalizedTab === 'media') {
        context.canvasCallbacks.setStudioMode(StudioMode.MEDIA);
      } else if (normalizedTab === 'linkedin' || normalizedTab === 'posts') {
        context.canvasCallbacks.setStudioMode(StudioMode.LINKEDIN);
      } else {
        context.canvasCallbacks.setStudioMode(StudioMode.CANVAS);
      }
    }

    return {
      success: true,
      result: `Navigated to ${tab} tab`,
      action: 'navigate_to_tab',
    };
  }
}

export class UndoActionCommand implements Command {
  name = 'undo_action';

  execute(_args: Record<string, unknown>, context: CommandContext): ActionResult {
    console.log('[UndoActionCommand] Executing undo');

    if (!context.canvasCallbacks.undo) {
      return {
        success: false,
        error: 'Undo not available.',
      };
    }

    context.canvasCallbacks.undo();

    return {
      success: true,
      result: 'Undid last action',
      action: 'undo_action',
    };
  }
}

export class RedoActionCommand implements Command {
  name = 'redo_action';

  execute(_args: Record<string, unknown>, context: CommandContext): ActionResult {
    console.log('[RedoActionCommand] Executing redo');

    if (!context.canvasCallbacks.redo) {
      return {
        success: false,
        error: 'Redo not available.',
      };
    }

    context.canvasCallbacks.redo();

    return {
      success: true,
      result: 'Redid action',
      action: 'redo_action',
    };
  }
}
