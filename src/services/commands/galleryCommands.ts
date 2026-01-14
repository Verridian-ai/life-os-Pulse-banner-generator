import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import {
  createDesign,
  getUserDesigns,
  getDesignById,
  deleteDesign as deleteDesignFromDb,
  searchDesigns,
} from '../database';

/**
 * SaveDesignCommand - Save current canvas state to gallery
 */
export class SaveDesignCommand implements Command {
  name = 'save_design';

  async execute(
    args: { title: string; description?: string; is_public?: boolean },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { title, description = '', is_public = false } = args;

    console.log('[SaveDesignCommand] Saving design:', { title, description });

    try {
      // Get current canvas image as thumbnail
      const canvasImage = context.getCanvasImage();

      // Get current elements from canvas
      const elements = context.canvasCallbacks.getElements?.() || [];

      const design = await createDesign({
        title,
        description,
        thumbnail_url: canvasImage || '',
        design_url: canvasImage || '',
        canvas_data: { elements, backgroundImage: canvasImage },
        width: 1584,
        height: 396,
        tags: [],
        is_public,
      });

      if (!design) {
        return {
          success: false,
          error: 'Failed to save design to database',
        };
      }

      return {
        success: true,
        result: `Design "${title}" saved successfully with ID: ${design.id}`,
        action: 'save_design',
      };
    } catch (error) {
      console.error('[SaveDesignCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save design',
      };
    }
  }
}

/**
 * LoadDesignCommand - Load a design from gallery by name or ID
 */
export class LoadDesignCommand implements Command {
  name = 'load_design';

  async execute(
    args: { design_id?: string; name?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { design_id, name } = args;

    console.log('[LoadDesignCommand] Loading design:', { design_id, name });

    try {
      let design = null;

      if (design_id) {
        design = await getDesignById(design_id);
      } else if (name) {
        // Search by name
        const designs = await getUserDesigns();
        design = designs.find((d) => d.title.toLowerCase() === name.toLowerCase());
      }

      if (!design) {
        return {
          success: false,
          error: design_id
            ? `Design with ID "${design_id}" not found`
            : `Design named "${name}" not found`,
        };
      }

      // Apply design to canvas
      if (design.design_url) {
        context.onUpdate(design.design_url, 'background');
      }

      // Restore elements if available
      if (design.canvas_data && typeof design.canvas_data === 'object') {
        const canvasData = design.canvas_data as { elements?: unknown[] };
        if (canvasData.elements && Array.isArray(canvasData.elements)) {
          // Clear existing and add new elements
          const currentElements = context.canvasCallbacks.getElements?.() || [];
          currentElements.forEach((el) => {
            context.canvasCallbacks.deleteElement?.(el.id);
          });
          canvasData.elements.forEach((el) => {
            context.canvasCallbacks.addElement?.(
              el as Parameters<NonNullable<typeof context.canvasCallbacks.addElement>>[0],
            );
          });
        }
      }

      return {
        success: true,
        result: `Loaded design "${design.title}"`,
        action: 'load_design',
      };
    } catch (error) {
      console.error('[LoadDesignCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load design',
      };
    }
  }
}

/**
 * DeleteDesignCommand - Delete a design from gallery
 */
export class DeleteDesignCommand implements Command {
  name = 'delete_design';

  async execute(args: { design_id: string }): Promise<ActionResult> {
    const { design_id } = args;

    console.log('[DeleteDesignCommand] Deleting design:', design_id);

    try {
      const success = await deleteDesignFromDb(design_id);

      if (!success) {
        return {
          success: false,
          error: `Failed to delete design with ID "${design_id}"`,
        };
      }

      return {
        success: true,
        result: `Design deleted successfully`,
        action: 'delete_design',
      };
    } catch (error) {
      console.error('[DeleteDesignCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete design',
      };
    }
  }
}

/**
 * ExportDesignCommand - Export current canvas to file format
 * Supports image formats (png, jpg, webp) and JSON for canvas data backup
 */
export class ExportDesignCommand implements Command {
  name = 'export_design';

  execute(
    args: { format?: 'png' | 'jpg' | 'webp' | 'json'; quality?: number; title?: string },
    context: CommandContext,
  ): ActionResult {
    const { format = 'png', quality = 0.9, title = 'design' } = args;

    console.log('[ExportDesignCommand] Exporting design:', { format, quality, title });

    try {
      // Handle JSON export separately
      if (format === 'json') {
        return this.exportAsJson(context, title);
      }

      // Handle image exports (png, jpg, webp)
      const canvasImage = context.getCanvasImage();

      if (!canvasImage) {
        return {
          success: false,
          error: 'No canvas image available to export',
        };
      }

      // Convert data URL to desired format if needed
      const exportUrl = canvasImage;

      // Create download link
      const link = document.createElement('a');
      link.download = `banner-${Date.now()}.${format}`;
      link.href = exportUrl;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        result: `Design exported as ${format.toUpperCase()}`,
        action: 'export_design',
      };
    } catch (error) {
      console.error('[ExportDesignCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export design',
      };
    }
  }

  /**
   * Export canvas state as JSON file
   * Includes elements, layers, and metadata for portable backup/sharing
   */
  private exportAsJson(context: CommandContext, title: string): ActionResult {
    try {
      // Get current elements from canvas
      const elements = context.canvasCallbacks.getElements?.() || [];

      // Get background image (optional - can be large)
      const backgroundImage = context.getCanvasImage();

      // Build exportable canvas data structure
      const canvasData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        title,
        canvas: {
          width: 1584,
          height: 396,
          elements,
          backgroundImage: backgroundImage || null,
        },
        metadata: {
          elementCount: elements.length,
          hasBackground: !!backgroundImage,
        },
      };

      // Serialize to JSON
      const jsonString = JSON.stringify(canvasData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`;
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      URL.revokeObjectURL(url);

      return {
        success: true,
        result: `Design exported as JSON (${elements.length} elements)`,
        action: 'export_design',
      };
    } catch (error) {
      console.error('[ExportDesignCommand] JSON export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export design as JSON',
      };
    }
  }
}

/**
 * ListDesignsCommand - List all saved designs
 */
export class ListDesignsCommand implements Command {
  name = 'list_designs';

  async execute(): Promise<ActionResult> {
    console.log('[ListDesignsCommand] Fetching designs');

    try {
      const designs = await getUserDesigns();

      if (designs.length === 0) {
        return {
          success: true,
          result: 'No saved designs found. Create your first design!',
          action: 'list_designs',
        };
      }

      const designList = designs
        .slice(0, 10)
        .map((d, i) => `${i + 1}. "${d.title}" (ID: ${d.id})`)
        .join('\n');

      return {
        success: true,
        result: `Found ${designs.length} designs:\n${designList}${designs.length > 10 ? `\n...and ${designs.length - 10} more` : ''}`,
        action: 'list_designs',
      };
    } catch (error) {
      console.error('[ListDesignsCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list designs',
      };
    }
  }
}

/**
 * SearchDesignsCommand - Search designs by title and optional tags
 */
export class SearchDesignsCommand implements Command {
  name = 'search_designs';

  async execute(
    args: { query: string; tags?: string[] },
    _context: CommandContext,
  ): Promise<ActionResult> {
    const { query, tags } = args;

    console.log('[SearchDesignsCommand] Searching designs:', { query, tags });

    try {
      const designs = await searchDesigns(query, tags);

      if (designs.length === 0) {
        const tagInfo = tags && tags.length > 0 ? ` with tags [${tags.join(', ')}]` : '';
        return {
          success: true,
          result: `No designs found matching "${query}"${tagInfo}. Try a different search term.`,
          action: 'search_designs',
        };
      }

      const designList = designs
        .slice(0, 10)
        .map((d, i) => {
          const tagDisplay = d.tags && d.tags.length > 0 ? ` [${d.tags.join(', ')}]` : '';
          return `${i + 1}. "${d.title}"${tagDisplay} (ID: ${d.id})`;
        })
        .join('\n');

      const tagInfo = tags && tags.length > 0 ? ` with tags [${tags.join(', ')}]` : '';
      return {
        success: true,
        result: `Found ${designs.length} designs matching "${query}"${tagInfo}:\n${designList}${designs.length > 10 ? `\n...and ${designs.length - 10} more` : ''}`,
        action: 'search_designs',
      };
    } catch (error) {
      console.error('[SearchDesignsCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search designs',
      };
    }
  }
}
