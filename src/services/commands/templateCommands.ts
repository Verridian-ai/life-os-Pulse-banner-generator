import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import { BANNER_TEMPLATES, BannerTemplate } from '@/constants/templates';
import type { BannerElement } from '@/types';

/**
 * ApplyTemplateCommand - Apply a template to the canvas
 */
export class ApplyTemplateCommand implements Command {
  name = 'apply_template';

  execute(
    args: { template_id?: string; template_name?: string },
    context: CommandContext,
  ): ActionResult {
    const { template_id, template_name } = args;

    console.log('[ApplyTemplateCommand] Applying template:', { template_id, template_name });

    let template: BannerTemplate | undefined;

    if (template_id) {
      template = BANNER_TEMPLATES.find((t) => t.id === template_id);
    } else if (template_name) {
      template = BANNER_TEMPLATES.find((t) =>
        t.title.toLowerCase().includes(template_name.toLowerCase()),
      );
    }

    if (!template) {
      const availableTemplates = BANNER_TEMPLATES.slice(0, 5)
        .map((t) => `"${t.title}"`)
        .join(', ');
      return {
        success: false,
        error: `Template not found. Available templates include: ${availableTemplates}...`,
      };
    }

    try {
      // Set background image
      context.onUpdate(template.backgroundUrl, 'background');

      // Clear existing elements and add template elements
      const currentElements = context.canvasCallbacks.getElements?.() || [];
      currentElements.forEach((el) => {
        context.canvasCallbacks.deleteElement?.(el.id);
      });

      // Add template elements
      template.elements.forEach((el, i) => {
        const element: BannerElement = {
          ...el,
          id: `template-${template!.id}-${i}-${Date.now()}`,
          content: el.content || '',
          x: el.x || 0,
          y: el.y || 0,
          type: el.type || 'text',
        } as BannerElement;
        context.canvasCallbacks.addElement?.(element);
      });

      // Set the prompt for regeneration capability
      if (context.setGenPrompt) {
        context.setGenPrompt(template.prompt);
      }

      return {
        success: true,
        result: `Applied "${template.title}" template (${template.industry})`,
        action: 'apply_template',
      };
    } catch (error) {
      console.error('[ApplyTemplateCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply template',
      };
    }
  }
}

/**
 * ListTemplatesCommand - List available templates
 */
export class ListTemplatesCommand implements Command {
  name = 'list_templates';

  execute(args: { industry?: string }): ActionResult {
    const { industry } = args;

    console.log('[ListTemplatesCommand] Listing templates:', { industry });

    let templates = BANNER_TEMPLATES;

    if (industry) {
      templates = templates.filter((t) => t.industry.toLowerCase() === industry.toLowerCase());
    }

    if (templates.length === 0) {
      const industries = [...new Set(BANNER_TEMPLATES.map((t) => t.industry))];
      return {
        success: true,
        result: `No templates found for "${industry}". Available industries: ${industries.join(', ')}`,
        action: 'list_templates',
      };
    }

    const templateList = templates
      .slice(0, 10)
      .map((t, i) => `${i + 1}. "${t.title}" (${t.industry}) - ${t.description}`)
      .join('\n');

    const industries = [...new Set(BANNER_TEMPLATES.map((t) => t.industry))];

    return {
      success: true,
      result: `Found ${templates.length} templates:\n${templateList}${templates.length > 10 ? `\n...and ${templates.length - 10} more` : ''}\n\nIndustries: ${industries.join(', ')}`,
      action: 'list_templates',
    };
  }
}

/**
 * SearchTemplatesCommand - Search templates by keyword
 */
export class SearchTemplatesCommand implements Command {
  name = 'search_templates';

  execute(args: { query: string }): ActionResult {
    const { query } = args;

    console.log('[SearchTemplatesCommand] Searching templates:', query);

    const results = BANNER_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.industry.toLowerCase().includes(query.toLowerCase()),
    );

    if (results.length === 0) {
      return {
        success: true,
        result: `No templates found matching "${query}". Try different keywords.`,
        action: 'search_templates',
      };
    }

    const templateList = results
      .slice(0, 5)
      .map((t, i) => `${i + 1}. "${t.title}" (ID: ${t.id}) - ${t.industry}`)
      .join('\n');

    return {
      success: true,
      result: `Found ${results.length} templates matching "${query}":\n${templateList}`,
      action: 'search_templates',
    };
  }
}
