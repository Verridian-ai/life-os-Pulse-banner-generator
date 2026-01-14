import type { Command, CommandContext } from './types';
import type { ActionResult } from '../actionExecutor';
import { enhancePrompt, analyzeImageForPrompts, analyzeCanvasAndSuggest } from '../llm';

export class SuggestPromptsCommand implements Command {
  name = 'suggest_prompts';

  execute(args: { industry?: string; role?: string }, _context: CommandContext): ActionResult {
    const { industry, role } = args;

    console.log('[SuggestPromptsCommand] Suggesting prompts for:', { industry, role });

    return {
      success: true,
      result: `Generating prompt suggestions for ${industry || 'general'} industry${role ? ` and ${role} role` : ''}...`,
    };
  }
}

export class WriteEnhancedPromptCommand implements Command {
  name = 'write_enhanced_prompt';

  async execute(
    args: { prompt: string; industry?: string; style?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const { prompt, industry, style } = args;

    console.log('[WriteEnhancedPromptCommand] Enhancing:', { prompt, industry, style });

    if (!context.setGenPrompt) {
      return {
        success: false,
        error: 'Prompt setter not configured. Cannot write to generation field.',
      };
    }

    try {
      const result = await enhancePrompt(prompt, { industry, style });

      if (result.enhancedPrompt) {
        context.setGenPrompt(result.enhancedPrompt);

        return {
          success: true,
          result: `Enhanced prompt written to generation field: "${result.enhancedPrompt.substring(0, 100)}..."`,
        };
      }

      return {
        success: false,
        error: 'Enhancement returned empty result',
      };
    } catch (error) {
      console.error('[WriteEnhancedPromptCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Prompt enhancement failed',
      };
    }
  }
}

export class AnalyzeImageCommand implements Command {
  name = 'analyze_image';

  async execute(args: { image_url?: string }, context: CommandContext): Promise<ActionResult> {
    const imageUrl = args.image_url || context.getCanvasImage();

    console.log('[AnalyzeImageCommand] Analyzing image');

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available to analyze. Please generate or upload an image first.',
      };
    }

    try {
      const analysis = await analyzeImageForPrompts(imageUrl);

      const result = {
        magicEditSuggestions: analysis.magicEdit || [],
        generationIdeas: analysis.generation || [],
      };

      return {
        success: true,
        result: JSON.stringify(result, null, 2),
        action: 'analyze_image',
      };
    } catch (error) {
      console.error('[AnalyzeImageCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed',
      };
    }
  }
}

export class AnalyzeBannerCommand implements Command {
  name = 'analyze_banner';

  async execute(_args: Record<string, unknown>, context: CommandContext): Promise<ActionResult> {
    const canvasImage = context.getCanvasImage();

    console.log('[AnalyzeBannerCommand] Analyzing banner');

    if (!canvasImage) {
      return {
        success: false,
        error: 'No banner available to analyze. Please generate or upload a banner first.',
      };
    }

    try {
      const analysis = await analyzeCanvasAndSuggest(canvasImage);

      return {
        success: true,
        result: JSON.stringify(analysis, null, 2),
        action: 'analyze_banner',
      };
    } catch (error) {
      console.error('[AnalyzeBannerCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Banner analysis failed',
      };
    }
  }
}

export class CompareImagesCommand implements Command {
  name = 'compare_images';

  async execute(
    args: { target_image?: string; reference_image?: string },
    context: CommandContext,
  ): Promise<ActionResult> {
    const targetImage = args.target_image || context.getCanvasImage();
    const referenceImage = args.reference_image; // In future, fallback to history

    console.log('[CompareImagesCommand] Comparing images');

    if (!targetImage) {
      return {
        success: false,
        error: 'No target image available to compare.',
      };
    }

    if (!referenceImage) {
      return {
        success: false,
        error:
          'No reference image provided. Please provide a reference image URL to compare against.',
      };
    }

    // Dynamic import to avoid circular dependency if any
    const { compareImages } = await import('../imageAnalysisService');

    try {
      const comparison = await compareImages(targetImage, referenceImage);

      return {
        success: true,
        result: JSON.stringify(comparison, null, 2),
        action: 'compare_images',
      };
    } catch (error) {
      console.error('[CompareImagesCommand] Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image comparison failed',
      };
    }
  }
}

export class BatchAnalyzeCommand implements Command {
  name = 'batch_analyze';

  async execute(args: { image_urls: string[] }, _context: CommandContext): Promise<ActionResult> {
    const { image_urls } = args;

    if (!image_urls || image_urls.length === 0) {
      return {
        success: false,
        error: 'No image URLs provided for batch analysis.',
      };
    }

    console.log(`[BatchAnalyzeCommand] Analyzing ${image_urls.length} images`);

    const results: Array<{
      url: string;
      analysis: {
        magicEditSuggestions: string[];
        generationIdeas: string[];
      } | null;
      error?: string;
    }> = [];

    const settledResults = await Promise.allSettled(
      image_urls.map(async (url) => {
        try {
          const analysis = await analyzeImageForPrompts(url);
          return {
            url,
            analysis: {
              magicEditSuggestions: analysis.magicEdit || [],
              generationIdeas: analysis.generation || [],
            },
          };
        } catch (error) {
          return {
            url,
            analysis: null,
            error: error instanceof Error ? error.message : 'Analysis failed',
          };
        }
      }),
    );

    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    const successCount = results.filter((r) => r.analysis !== null).length;
    const errorCount = results.filter((r) => r.error).length;

    console.log(`[BatchAnalyzeCommand] Complete: ${successCount} success, ${errorCount} errors`);

    return {
      success: successCount > 0,
      result: JSON.stringify(
        {
          summary: {
            total: image_urls.length,
            success: successCount,
            errors: errorCount,
          },
          results,
        },
        null,
        2,
      ),
      action: 'batch_analyze',
    };
  }
}

export class BatchCompareCommand implements Command {
  name = 'batch_compare';

  async execute(
    args: {
      image_urls: string[];
      reference_image: string;
      criteria?: string;
    },
    _context: CommandContext,
  ): Promise<ActionResult> {
    const { image_urls, reference_image, criteria } = args;

    if (!image_urls || image_urls.length === 0) {
      return {
        success: false,
        error: 'No image URLs provided for batch comparison.',
      };
    }

    if (!reference_image) {
      return {
        success: false,
        error:
          'No reference image provided. Please provide a reference image URL to compare against.',
      };
    }

    console.log(`[BatchCompareCommand] Comparing ${image_urls.length} images against reference`);

    // Dynamic import to avoid circular dependency
    const { compareImages } = await import('../imageAnalysisService');

    const results: Array<{
      url: string;
      comparison: unknown | null;
      error?: string;
    }> = [];

    const settledResults = await Promise.allSettled(
      image_urls.map(async (url) => {
        try {
          const comparison = await compareImages(url, reference_image);
          return {
            url,
            comparison,
          };
        } catch (error) {
          return {
            url,
            comparison: null,
            error: error instanceof Error ? error.message : 'Comparison failed',
          };
        }
      }),
    );

    for (const result of settledResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    const successCount = results.filter((r) => r.comparison !== null).length;
    const errorCount = results.filter((r) => r.error).length;

    // Sort results by similarity if comparisons contain scores
    const sortedResults = results.sort((a, b) => {
      const scoreA = (a.comparison as { similarityScore?: number })?.similarityScore || 0;
      const scoreB = (b.comparison as { similarityScore?: number })?.similarityScore || 0;
      return scoreB - scoreA; // Highest similarity first
    });

    console.log(`[BatchCompareCommand] Complete: ${successCount} success, ${errorCount} errors`);

    return {
      success: successCount > 0,
      result: JSON.stringify(
        {
          summary: {
            total: image_urls.length,
            success: successCount,
            errors: errorCount,
            referenceImage: reference_image,
            criteria: criteria || 'default',
          },
          results: sortedResults,
        },
        null,
        2,
      ),
      action: 'batch_compare',
    };
  }
}
