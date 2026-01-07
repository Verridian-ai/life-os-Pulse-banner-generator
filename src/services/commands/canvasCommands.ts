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
  }, context: CommandContext): ActionResult {
    const { text, x = 792, y = 198, fontSize = 48, color = '#ffffff', fontFamily = 'Inter' } = args;

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
      fontWeight: '600',
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
