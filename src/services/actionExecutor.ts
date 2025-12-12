// Action Executor - Execute AI assistant tool calls on behalf of the user
import { generateImage } from './llm';
import { getReplicateService } from './replicate';

export interface ToolCall {
    name: string;
    args: Record<string, unknown>;
}

export interface ActionResult {
    success: boolean;
    result?: string;
    error?: string;
    preview?: string; // Image URL for preview
}

export type OnUpdateCallback = (imageUrl: string, type: 'background' | 'profile') => void;

/**
 * ActionExecutor - Handles execution of AI tool calls
 */
export class ActionExecutor {
    private onUpdate: OnUpdateCallback;
    private previewMode: boolean;

    constructor(onUpdate: OnUpdateCallback, previewMode = false) {
        this.onUpdate = onUpdate;
        this.previewMode = previewMode;
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
                    return await this.generateBackground(toolCall.args as { prompt: string; quality?: string });

                case 'magic_edit':
                    return await this.magicEdit(toolCall.args as { base_image: string; prompt: string; mask?: string });

                case 'remove_background':
                    return await this.removeBackground(toolCall.args as { image_url: string });

                case 'upscale_image':
                    return await this.upscaleImage(toolCall.args as { image_url: string; mode?: string });

                case 'restore_image':
                    return await this.restoreImage(toolCall.args as { image_url: string });

                case 'enhance_face':
                    return await this.enhanceFace(toolCall.args as { image_url: string });

                default:
                    return {
                        success: false,
                        error: `Unknown tool: ${toolCall.name}`
                    };
            }
        } catch (error) {
            console.error('[ActionExecutor] Tool execution failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Generate background image
     */
    private async generateBackground(args: { prompt: string; quality?: string }): Promise<ActionResult> {
        const { prompt, quality = '2K' } = args;

        console.log('[ActionExecutor] Generating background:', { prompt, quality });

        try {
            const imageUrl = await generateImage(
                prompt,
                [],
                quality as '1K' | '2K' | '4K'
            );

            if (!imageUrl) {
                return { success: false, error: 'Image generation returned null' };
            }

            // If preview mode, return preview without applying
            if (this.previewMode) {
                return {
                    success: true,
                    result: imageUrl,
                    preview: imageUrl
                };
            }

            // Auto-apply mode: Update canvas immediately
            this.onUpdate(imageUrl, 'background');

            return {
                success: true,
                result: imageUrl
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Generation failed'
            };
        }
    }

    /**
     * Magic edit with inpainting
     */
    private async magicEdit(args: { base_image: string; prompt: string; mask?: string }): Promise<ActionResult> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { base_image: _base_image, prompt, mask } = args;

        console.log('[ActionExecutor] Magic edit:', { prompt, hasMask: !!mask });

        // Note: This requires the current background image
        // For now, return error - this needs canvas context
        return {
            success: false,
            error: 'Magic edit requires current canvas state - use Studio tab'
        };
    }

    /**
     * Remove background from image
     */
    private async removeBackground(args: { image_url: string }): Promise<ActionResult> {
        const { image_url } = args;

        console.log('[ActionExecutor] Removing background from:', image_url);

        // TODO: Implement removeBackground in replicate service
        return {
            success: false,
            error: 'Remove background feature is not yet implemented'
        };
    }

    /**
     * Upscale image
     */
    private async upscaleImage(args: { image_url: string; mode?: string }): Promise<ActionResult> {
        const { image_url, mode = 'balanced' } = args;

        console.log('[ActionExecutor] Upscaling image:', { image_url, mode });

        try {
            const service = getReplicateService();
            const resultUrl = await service.upscale(image_url, mode as 'fast' | 'balanced' | 'best');

            if (this.previewMode) {
                return {
                    success: true,
                    result: resultUrl,
                    preview: resultUrl
                };
            }

            this.onUpdate(resultUrl, 'background');

            return {
                success: true,
                result: resultUrl
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upscale failed'
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
            const service = getReplicateService();
            const resultUrl = await service.restore(image_url);

            if (this.previewMode) {
                return {
                    success: true,
                    result: resultUrl,
                    preview: resultUrl
                };
            }

            this.onUpdate(resultUrl, 'background');

            return {
                success: true,
                result: resultUrl
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Restore failed'
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
            const service = getReplicateService();
            const resultUrl = await service.faceEnhance(image_url);

            if (this.previewMode) {
                return {
                    success: true,
                    result: resultUrl,
                    preview: resultUrl
                };
            }

            this.onUpdate(resultUrl, 'profile');

            return {
                success: true,
                result: resultUrl
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Face enhance failed'
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
}
