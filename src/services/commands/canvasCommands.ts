import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import type { BannerElement } from '@/types';

export class AddTextElementCommand implements Command {
  name = 'add_text_element';

  execute(args: {
    text: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing?: number;
  }, context: CommandContext): ActionResult {
    const {
      text,
      x = 792,
      y = 198,
      fontSize = 48,
      color = '#ffffff',
      fontFamily = 'Inter',
      fontWeight = '600',
      textTransform = 'none',
      letterSpacing = 0
    } = args;

    console.log('[AddTextElementCommand] Adding text:', { text, x, y, fontSize, color });

    if (!context.canvasCallbacks.addElement) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot add elements.',
      };
    }

    const element: BannerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: text,
      x,
      y,
      fontSize,
      color,
      fontFamily,
      fontWeight,
      textTransform,
      letterSpacing,
      textAlign: 'center',
    };

    context.canvasCallbacks.addElement(element);

    return {
      success: true,
      result: `Added text element: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      action: 'add_text_element',
    };
  }
}

export class UpdateElementCommand implements Command {
  name = 'update_element';

  execute(args: {
    element_id: string;
    properties: Partial<BannerElement>;
  }, context: CommandContext): ActionResult {
    const { element_id, properties } = args;

    console.log('[UpdateElementCommand] Updating:', { element_id, properties });

    if (!context.canvasCallbacks.updateElement) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot update elements.',
      };
    }

    context.canvasCallbacks.updateElement(element_id, properties);

    return {
      success: true,
      result: `Updated element ${element_id}`,
      action: 'update_element',
    };
  }
}

export class DeleteElementCommand implements Command {
  name = 'delete_element';

  execute(args: { element_id: string }, context: CommandContext): ActionResult {
    const { element_id } = args;

    console.log('[DeleteElementCommand] Deleting:', element_id);

    if (!context.canvasCallbacks.deleteElement) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot delete elements.',
      };
    }

    context.canvasCallbacks.deleteElement(element_id);

    return {
      success: true,
      result: `Deleted element ${element_id}`,
      action: 'delete_element',
    };
  }
}

export class ListElementsCommand implements Command {
  name = 'list_elements';

  execute(_args: Record<string, unknown>, context: CommandContext): ActionResult {
    console.log('[ListElementsCommand] Listing elements');

    if (!context.canvasCallbacks.getElements) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot list elements.',
      };
    }

    const elements = context.canvasCallbacks.getElements();
    const summary = elements.map((el) => ({
      id: el.id,
      type: el.type,
      content: el.type === 'text' ? el.content.substring(0, 30) : el.content,
      position: { x: el.x, y: el.y },
    }));

    return {
      success: true,
      result: JSON.stringify(summary, null, 2),
      action: 'list_elements',
    };
  }
}

export class BringToFrontCommand implements Command {
  name = 'bring_to_front';

  execute(args: { element_id: string }, context: CommandContext): ActionResult {
    const { element_id } = args;
    console.log('[BringToFront] bringing to front:', element_id);

    if (!context.canvasCallbacks.bringToFront) {
      return { success: false, error: 'Layer ops not supported' };
    }

    context.canvasCallbacks.bringToFront(element_id);

    return {
      success: true,
      result: `Brought element ${element_id} to front`,
      action: 'bring_to_front',
    };
  }
}

export class SendToBackCommand implements Command {
  name = 'send_to_back';

  execute(args: { element_id: string }, context: CommandContext): ActionResult {
    const { element_id } = args;
    console.log('[SendToBack] sending to back:', element_id);

    if (!context.canvasCallbacks.sendToBack) {
      return { success: false, error: 'Layer ops not supported' };
    }

    context.canvasCallbacks.sendToBack(element_id);

    return {
      success: true,
      result: `Sent element ${element_id} to back`,
      action: 'send_to_back',
    };
  }
}

export class DuplicateElementCommand implements Command {
  name = 'duplicate_element';

  execute(args: { element_id: string }, context: CommandContext): ActionResult {
    const { element_id } = args;
    if (!context.canvasCallbacks.getElements || !context.canvasCallbacks.addElement) {
      return { success: false, error: 'Canvas state access missing' };
    }

    const elements = context.canvasCallbacks.getElements();
    const original = elements.find(e => e.id === element_id);
    if (!original) return { success: false, error: 'Element not found' };

    const clone: BannerElement = {
      ...original,
      id: `${original.type}-${Date.now()}`,
      x: original.x + 20,
      y: original.y + 20,
    };

    context.canvasCallbacks.addElement(clone);
    return { success: true, result: `Duplicated element ${element_id}`, action: 'duplicate_element' };
  }
}

export class LockElementCommand implements Command {
  name = 'lock_element';
  execute(args: { element_id: string }, context: CommandContext): ActionResult {
    if (!context.canvasCallbacks.updateElement) {
      return { success: false, error: 'Cannot update element' };
    }
    context.canvasCallbacks.updateElement(args.element_id, { locked: true });
    return { success: true, result: `Locked element ${args.element_id}` };
  }
}

export class GroupElementsCommand implements Command {
  name = 'group_elements';
  execute(_args: { element_ids: string[] }, _context: CommandContext): ActionResult {
    // Basic stub since group logic is complex
    return { success: false, error: 'Grouping not implemented' };
  }
}
