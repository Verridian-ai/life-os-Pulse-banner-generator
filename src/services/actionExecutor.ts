// Action Executor - Execute AI assistant tool calls on behalf of the user
import { generateImage, enhancePrompt, analyzeImageForPrompts, analyzeCanvasAndSuggest } from './llm';
import { getReplicateService } from './replicate';
import type { BannerElement } from '@/types';
import { Tab } from '@/constants';

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  result?: string;
  error?: string;
  preview?: string; // Image URL for preview
  imageUrl?: string; // Image URL for action result
  action?: string; // Action type identifier
}

export type OnUpdateCallback = (imageUrl: string, type: 'background' | 'profile') => void;

export type SetGenPromptCallback = (prompt: string) => void;

// Canvas manipulation callbacks for voice control
export interface CanvasCallbacks {
  addElement?: (element: BannerElement) => void;
  updateElement?: (id: string, updates: Partial<BannerElement>) => void;
  deleteElement?: (id: string) => void;
  getElements?: () => BannerElement[];
  undo?: () => void;
  redo?: () => void;
  setActiveTab?: (tab: Tab) => void;
}

/**
 * ActionExecutor - Handles execution of AI tool calls
 */
export class ActionExecutor {
  private onUpdate: OnUpdateCallback;
  private previewMode: boolean;
  private getCanvasImage: () => string | undefined;
  private setGenPrompt?: SetGenPromptCallback;
  private canvasCallbacks: CanvasCallbacks;

  constructor(
    onUpdate: OnUpdateCallback,
    previewMode = false,
    getCanvasImage?: () => string | undefined,
    setGenPrompt?: SetGenPromptCallback,
    canvasCallbacks?: CanvasCallbacks
  ) {
    this.onUpdate = onUpdate;
    this.previewMode = previewMode;
    this.getCanvasImage = getCanvasImage || (() => undefined);
    this.setGenPrompt = setGenPrompt;
    this.canvasCallbacks = canvasCallbacks || {};
  }

  /**
   * Set canvas manipulation callbacks
   */
  setCanvasCallbacks(callbacks: CanvasCallbacks) {
    this.canvasCallbacks = { ...this.canvasCallbacks, ...callbacks };
    console.log('[ActionExecutor] Canvas callbacks configured');
  }

  /**
   * Set the prompt setter callback for voice-to-prompt enhancement
   */
  setPromptSetter(setter: SetGenPromptCallback) {
    this.setGenPrompt = setter;
    console.log('[ActionExecutor] Prompt setter configured');
  }

  /**
   * Set canvas image getter for magic edit operations
   */
  setCanvasImageGetter(getter: () => string | undefined) {
    this.getCanvasImage = getter;
    console.log('[ActionExecutor] Canvas image getter set');
  }

  /**
   * Set preview mode
   */
  setPreviewMode(enabled: boolean) {
    this.previewMode = enabled;
    console.log('[ActionExecutor] Preview mode:', enabled ? 'ON' : 'OFF');
  }

  /**
   * Execute a tool call
   */
  async executeToolCall(toolCall: ToolCall): Promise<ActionResult> {
    console.log('[ActionExecutor] Executing tool:', toolCall.name, toolCall.args);

    try {
      switch (toolCall.name) {
        case 'generate_background':
          return await this.generateBackground(
            toolCall.args as { prompt: string; quality?: string },
          );

        case 'magic_edit':
          return await this.magicEdit(
            toolCall.args as { base_image: string; prompt: string; mask?: string },
          );

        case 'remove_background':
          return await this.removeBackground(toolCall.args as { image_url?: string });

        case 'upscale_image':
          return await this.upscaleImage(toolCall.args as { image_url: string; mode?: string });

        case 'restore_image':
          return await this.restoreImage(toolCall.args as { image_url: string });

        case 'enhance_face':
          return await this.enhanceFace(toolCall.args as { image_url: string });

        case 'suggest_prompts':
          return this.suggestPrompts(
            toolCall.args as { industry?: string; role?: string },
          );

        case 'write_enhanced_prompt':
          return await this.writeEnhancedPrompt(
            toolCall.args as { prompt: string; industry?: string; style?: string },
          );

        // Canvas manipulation tools
        case 'add_text_element':
          return this.addTextElement(
            toolCall.args as { text: string; x?: number; y?: number; fontSize?: number; color?: string; fontFamily?: string },
          );

        case 'update_element':
          return this.updateElementTool(
            toolCall.args as { element_id: string; properties: Partial<BannerElement> },
          );

        case 'delete_element':
          return this.deleteElementTool(
            toolCall.args as { element_id: string },
          );

        case 'list_elements':
          return this.listElements();

        // Navigation tools
        case 'navigate_to_tab':
          return this.navigateToTab(
            toolCall.args as { tab: string },
          );

        // History tools
        case 'undo_action':
          return this.undoAction();

        case 'redo_action':
          return this.redoAction();

        // Analysis tools
        case 'analyze_image':
          return await this.analyzeImage(
            toolCall.args as { image_url?: string },
          );

        case 'analyze_banner':
          return await this.analyzeBanner();

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`,
          };
      }
    } catch (error) {
      console.error('[ActionExecutor] Tool execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate background image
   */
  private async generateBackground(args: {
    prompt: string;
    quality?: string;
  }): Promise<ActionResult> {
    const { prompt, quality = '2K' } = args;

    // Enhance prompt for single cohesive banner (prevents 3-panel collage generation)
    const bannerPrompt = `A single cohesive LinkedIn banner image, ultra-wide 4:1 aspect ratio, seamless professional design. ${prompt}. One unified scene, no panels, no divisions, no collage, no tiled sections.`;

    console.log('[ActionExecutor] Generating background:', { originalPrompt: prompt, enhancedPrompt: bannerPrompt, quality });

    try {
      const imageUrl = await generateImage(bannerPrompt, [], quality as '1K' | '2K' | '4K', true);

      if (!imageUrl) {
        return { success: false, error: 'Image generation returned null' };
      }

      // If preview mode, return preview without applying
      if (this.previewMode) {
        return {
          success: true,
          result: imageUrl,
          preview: imageUrl,
        };
      }

      // Auto-apply mode: Update canvas immediately
      this.onUpdate(imageUrl, 'background');

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

  /**
   * Magic edit with inpainting
   */
  private async magicEdit(args: {
    base_image: string;
    prompt: string;
    mask?: string;
  }): Promise<ActionResult> {
    const { base_image, prompt, mask } = args;

    // Try to get image from args first, then from canvas getter
    const imageUrl = base_image || this.getCanvasImage?.();

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available for magic edit. Please generate or upload an image first.',
      };
    }

    console.log('[ActionExecutor] Magic edit:', { prompt, hasMask: !!mask, hasImage: !!imageUrl });

    try {
      const replicateService = await getReplicateService();
      // Use inpaint if mask is provided, otherwise magic edit
      let resultUrl: string;
      if (mask) {
        resultUrl = await replicateService.inpaint(imageUrl, mask, prompt);
      } else {
        resultUrl = await replicateService.magicEdit(imageUrl, prompt);
      }

      if (this.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
          action: 'magic_edit',
        };
      }

      this.onUpdate(resultUrl, 'background');

      return {
        success: true,
        result: resultUrl,
        imageUrl: resultUrl,
        action: 'magic_edit',
      };
    } catch (error) {
      console.error('[ActionExecutor] Magic edit failed:', error);
      return {
        success: false,
        error: `Magic edit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Remove background from image
   */
  private async removeBackground(args: { image_url?: string }): Promise<ActionResult> {
    const imageUrl = args.image_url || this.getCanvasImage?.();

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available. Please generate or upload an image first.',
      };
    }

    console.log('[ActionExecutor] Removing background from image');

    try {
      const replicateService = await getReplicateService();
      const resultUrl = await replicateService.removeBg(imageUrl);

      return {
        success: true,
        imageUrl: resultUrl,
        action: 'remove_background',
      };
    } catch (error) {
      console.error('[ActionExecutor] Remove background failed:', error);
      return {
        success: false,
        error: `Remove background failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Upscale image
   */
  private async upscaleImage(args: { image_url: string; mode?: string }): Promise<ActionResult> {
    const { image_url, mode = 'balanced' } = args;

    console.log('[ActionExecutor] Upscaling image:', { image_url, mode });

    try {
      const service = await getReplicateService();
      const resultUrl = await service.upscale(image_url, mode as 'fast' | 'balanced' | 'best');

      if (this.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      this.onUpdate(resultUrl, 'background');

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

  /**
   * Restore/enhance old or damaged photos
   */
  private async restoreImage(args: { image_url: string }): Promise<ActionResult> {
    const { image_url } = args;

    console.log('[ActionExecutor] Restoring image:', image_url);

    try {
      const service = await getReplicateService();
      const resultUrl = await service.restore(image_url);

      if (this.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      this.onUpdate(resultUrl, 'background');

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

  /**
   * Enhance face in image
   */
  private async enhanceFace(args: { image_url: string }): Promise<ActionResult> {
    const { image_url } = args;

    console.log('[ActionExecutor] Enhancing face:', image_url);

    try {
      const service = await getReplicateService();
      const resultUrl = await service.faceEnhance(image_url);

      if (this.previewMode) {
        return {
          success: true,
          result: resultUrl,
          preview: resultUrl,
        };
      }

      this.onUpdate(resultUrl, 'profile');

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

  /**
   * Suggest creative prompts for LinkedIn banners
   * This is a text-only tool - returns suggestions without executing any action
   */
  private suggestPrompts(args: { industry?: string; role?: string }): ActionResult {
    const { industry, role } = args;

    console.log('[ActionExecutor] Suggesting prompts for:', { industry, role });

    // This tool doesn't execute an action - it's handled by the AI's text response
    // We just acknowledge that the tool was called successfully
    return {
      success: true,
      result: `Generating prompt suggestions for ${industry || 'general'} industry${role ? ` and ${role} role` : ''}...`,
    };
  }

  /**
   * Write enhanced prompt to the generation input field
   * Voice agent uses this to enhance spoken prompts and write them to the UI
   */
  private async writeEnhancedPrompt(args: {
    prompt: string;
    industry?: string;
    style?: string;
  }): Promise<ActionResult> {
    const { prompt, industry, style } = args;

    console.log('[ActionExecutor] Enhancing and writing prompt:', { prompt, industry, style });

    if (!this.setGenPrompt) {
      return {
        success: false,
        error: 'Prompt setter not configured. Cannot write to generation field.',
      };
    }

    try {
      // Call the prompt enhancement service
      const result = await enhancePrompt(prompt, { industry, style });

      if (result.enhancedPrompt) {
        // Write the enhanced prompt to the generation input field
        this.setGenPrompt(result.enhancedPrompt);

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
      console.error('[ActionExecutor] Prompt enhancement failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Prompt enhancement failed',
      };
    }
  }

  /**
   * Apply a previewed action to the canvas
   */
  applyPreview(imageUrl: string, type: 'background' | 'profile' = 'background') {
    console.log('[ActionExecutor] Applying preview:', { imageUrl, type });
    this.onUpdate(imageUrl, type);
  }

  // ============================================
  // Canvas Manipulation Tools
  // ============================================

  /**
   * Add a text element to the canvas
   */
  private addTextElement(args: {
    text: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
  }): ActionResult {
    const { text, x = 792, y = 198, fontSize = 48, color = '#ffffff', fontFamily = 'Inter' } = args;

    console.log('[ActionExecutor] Adding text element:', { text, x, y, fontSize, color });

    if (!this.canvasCallbacks.addElement) {
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

    this.canvasCallbacks.addElement(element);

    return {
      success: true,
      result: `Added text element: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      action: 'add_text_element',
    };
  }

  /**
   * Update an element's properties
   */
  private updateElementTool(args: {
    element_id: string;
    properties: Partial<BannerElement>;
  }): ActionResult {
    const { element_id, properties } = args;

    console.log('[ActionExecutor] Updating element:', { element_id, properties });

    if (!this.canvasCallbacks.updateElement) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot update elements.',
      };
    }

    this.canvasCallbacks.updateElement(element_id, properties);

    return {
      success: true,
      result: `Updated element ${element_id}`,
      action: 'update_element',
    };
  }

  /**
   * Delete an element from the canvas
   */
  private deleteElementTool(args: { element_id: string }): ActionResult {
    const { element_id } = args;

    console.log('[ActionExecutor] Deleting element:', element_id);

    if (!this.canvasCallbacks.deleteElement) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot delete elements.',
      };
    }

    this.canvasCallbacks.deleteElement(element_id);

    return {
      success: true,
      result: `Deleted element ${element_id}`,
      action: 'delete_element',
    };
  }

  /**
   * List all current canvas elements
   */
  private listElements(): ActionResult {
    console.log('[ActionExecutor] Listing canvas elements');

    if (!this.canvasCallbacks.getElements) {
      return {
        success: false,
        error: 'Canvas not connected. Cannot list elements.',
      };
    }

    const elements = this.canvasCallbacks.getElements();
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

  // ============================================
  // Navigation Tools
  // ============================================

  /**
   * Navigate to a different tab
   */
  private navigateToTab(args: { tab: string }): ActionResult {
    const { tab } = args;

    console.log('[ActionExecutor] Navigating to tab:', tab);

    if (!this.canvasCallbacks.setActiveTab) {
      return {
        success: false,
        error: 'Navigation not connected. Cannot change tabs.',
      };
    }

    const tabMap: Record<string, Tab> = {
      studio: Tab.STUDIO,
      gallery: Tab.GALLERY,
      brainstorm: Tab.BRAINSTORM,
    };

    const targetTab = tabMap[tab.toLowerCase()];
    if (!targetTab) {
      return {
        success: false,
        error: `Unknown tab: ${tab}. Valid tabs: studio, gallery, brainstorm`,
      };
    }

    this.canvasCallbacks.setActiveTab(targetTab);

    return {
      success: true,
      result: `Navigated to ${tab} tab`,
      action: 'navigate_to_tab',
    };
  }

  // ============================================
  // History Tools
  // ============================================

  /**
   * Undo the last canvas action
   */
  private undoAction(): ActionResult {
    console.log('[ActionExecutor] Executing undo');

    if (!this.canvasCallbacks.undo) {
      return {
        success: false,
        error: 'Undo not available.',
      };
    }

    this.canvasCallbacks.undo();

    return {
      success: true,
      result: 'Undid last action',
      action: 'undo_action',
    };
  }

  /**
   * Redo a previously undone action
   */
  private redoAction(): ActionResult {
    console.log('[ActionExecutor] Executing redo');

    if (!this.canvasCallbacks.redo) {
      return {
        success: false,
        error: 'Redo not available.',
      };
    }

    this.canvasCallbacks.redo();

    return {
      success: true,
      result: 'Redid action',
      action: 'redo_action',
    };
  }

  // ============================================
  // Analysis Tools
  // ============================================

  /**
   * Analyze an image and suggest creative edit prompts or generation ideas
   */
  private async analyzeImage(args: { image_url?: string }): Promise<ActionResult> {
    const imageUrl = args.image_url || this.getCanvasImage?.();

    console.log('[ActionExecutor] Analyzing image for prompts');

    if (!imageUrl) {
      return {
        success: false,
        error: 'No image available to analyze. Please generate or upload an image first.',
      };
    }

    try {
      const analysis = await analyzeImageForPrompts(imageUrl);

      // Format the analysis result for voice response
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
      console.error('[ActionExecutor] Image analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed',
      };
    }
  }

  /**
   * Analyze the current banner and provide professional improvement suggestions
   */
  private async analyzeBanner(): Promise<ActionResult> {
    const canvasImage = this.getCanvasImage?.();

    console.log('[ActionExecutor] Analyzing banner for improvements');

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
      console.error('[ActionExecutor] Banner analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Banner analysis failed',
      };
    }
  }
}
