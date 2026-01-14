import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import { generateImage } from '../llm';
import { getReplicateService } from '../replicate';

export class GenerateBackgroundCommand implements Command {
  name = 'generate_background';

  async execute(
    args: { prompt: string; quality?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { prompt, quality = '2K' } = args;

    // Enhance prompt for single cohesive banner
    const bannerPrompt = `A single cohesive LinkedIn banner image, ultra-wide 4:1 aspect ratio, seamless professional design. ${prompt}. One unified scene, no panels, no divisions, no collage, no tiled sections.`;

    console.log('[GenerateBackgroundCommand] Generating:', {
      originalPrompt: prompt,
      enhancedPrompt: bannerPrompt,
      quality,
    });

    try {
      const imageUrl = await generateImage(bannerPrompt, [], quality as '1K' | '2K' | '4K', {
        width: 1584,
        height: 396,
      });

      if (!imageUrl) {
        return { success: false, error: 'Image generation returned null' };
      }

      if (context.previewMode) {
        return {
          success: true,
          result: imageUrl,
          preview: imageUrl,
        };
      }

      context.onUpdate(imageUrl, 'background');

      return {
        success: true,
        result: imageUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    }
  }
}

export class MagicEditCommand implements Command {
  name = 'magic_edit';

  async execute(
    args: { base_image: string; prompt: string; mask?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { base_image, prompt, mask } = args;
    const imageUrl = base_image || context.getCanvasImage();

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available for magic edit. Please generate or upload an image first.',
      };
    }

    console.log('[MagicEditCommand] Edit:', { prompt, hasMask: !!mask, hasImage: !!imageUrl });

    try {
      const replicateService = await getReplicateService();
      let resultUrl: string;
      if (mask) {
        resultUrl = await replicateService.inpaint(imageUrl, mask, prompt);
      } else {
        resultUrl = await replicateService.magicEdit(imageUrl, prompt);
      }

      if (context.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
          action: 'magic_edit',
        };
      }

      context.onUpdate(resultUrl, 'background');

      return {
        success: true,
        result: resultUrl,
        imageUrl: resultUrl,
        action: 'magic_edit',
      };
    } catch (error) {
      console.error('[MagicEditCommand] Failed:', error);
      return {
        success: false,
        error: `Magic edit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

export class RemoveBackgroundCommand implements Command {
  name = 'remove_background';

  async execute(args: { image_url?: string }, context: CommandContext): Promise<ActionResult> {
    const imageUrl = args.image_url || context.getCanvasImage();

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available. Please generate or upload an image first.',
      };
    }

    console.log('[RemoveBackgroundCommand] Removing background');

    try {
      const replicateService = await getReplicateService();
      const resultUrl = await replicateService.removeBg(imageUrl);

      return {
        success: true,
        imageUrl: resultUrl,
        action: 'remove_background',
      };
    } catch (error) {
      console.error('[RemoveBackgroundCommand] Failed:', error);
      return {
        success: false,
        error: `Remove background failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

export class UpscaleImageCommand implements Command {
  name = 'upscale_image';

  async execute(
    args: { image_url: string; mode?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { image_url, mode = 'balanced' } = args;

    console.log('[UpscaleImageCommand] Upscaling:', { image_url, mode });

    try {
      const service = await getReplicateService();
      const resultUrl = await service.upscale(image_url, mode as 'fast' | 'balanced' | 'best');

      if (context.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      context.onUpdate(resultUrl, 'background');

      return {
        success: true,
        result: resultUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upscale failed',
      };
    }
  }
}

export class RestoreImageCommand implements Command {
  name = 'restore_image';

  async execute(args: { image_url: string }, context: CommandContext): Promise<ActionResult> {
    const { image_url } = args;

    console.log('[RestoreImageCommand] Restoring:', image_url);

    try {
      const service = await getReplicateService();
      const resultUrl = await service.restore(image_url);

      if (context.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      context.onUpdate(resultUrl, 'background');

      return {
        success: true,
        result: resultUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      };
    }
  }
}

export class EnhanceFaceCommand implements Command {
  name = 'enhance_face';

  async execute(args: { image_url: string }, context: CommandContext): Promise<ActionResult> {
    const { image_url } = args;

    console.log('[EnhanceFaceCommand] Enhancing face:', image_url);

    try {
      const service = await getReplicateService();
      const resultUrl = await service.faceEnhance(image_url);

      if (context.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      context.onUpdate(resultUrl, 'profile');

      return {
        success: true,
        result: resultUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Face enhance failed',
      };
    }
  }
}

export class BatchUpscaleCommand implements Command {
  name = 'batch_upscale';

  async execute(
    args: { image_urls: string[]; mode?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { image_urls, mode = 'balanced' } = args;
    const results: string[] = [];
    const errors: string[] = [];

    console.log(`[BatchUpscaleCommand] Processing ${image_urls.length} images`);

    try {
      const service = await getReplicateService();

      for (let i = 0; i < image_urls.length; i++) {
        const url = image_urls[i];
        console.log(`[BatchUpscaleCommand] Upscaling ${i + 1}/${image_urls.length}`);

        try {
          const resultUrl = await service.upscale(url, mode as 'fast' | 'balanced' | 'best');
          results.push(resultUrl);

          // Verify if we should update canvas for each step or just return results
          // For now, we update to show liveliness if it is not preview mode
          if (!context.previewMode) {
            context.onUpdate(resultUrl, 'background');
          }
        } catch (err) {
          console.error(`[BatchUpscaleCommand] Failed image ${i + 1}:`, err);
          errors.push(`Image ${i + 1} failed`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return {
          success: false,
          error: `Batch upscale failed. ${errors.length} errors.`,
        };
      }

      return {
        success: true,
        result: JSON.stringify({ success: results, errors }),
        action: 'batch_upscale',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch upscale failed',
      };
    }
  }
}

export class BatchRemoveBackgroundCommand implements Command {
  name = 'batch_remove_background';

  async execute(args: { image_urls: string[] }, context: CommandContext): Promise<ActionResult> {
    const { image_urls } = args;
    const results: string[] = [];
    const errors: string[] = [];

    console.log(`[BatchRemoveBackgroundCommand] Processing ${image_urls.length} images`);

    try {
      const service = await getReplicateService();

      for (let i = 0; i < image_urls.length; i++) {
        const url = image_urls[i];
        console.log(`[BatchRemoveBackgroundCommand] Processing ${i + 1}/${image_urls.length}`);

        try {
          const resultUrl = await service.removeBg(url);
          results.push(resultUrl);

          if (!context.previewMode) {
            context.onUpdate(resultUrl, 'background');
          }
        } catch (err) {
          console.error(`[BatchRemoveBackgroundCommand] Failed image ${i + 1}:`, err);
          errors.push(`Image ${i + 1} failed`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return {
          success: false,
          error: `Batch processing failed. ${errors.length} errors.`,
        };
      }

      return {
        success: true,
        result: JSON.stringify({ success: results, errors }),
        action: 'batch_remove_background',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch processing failed',
      };
    }
  }
}
