
// Replicate API Service - Updated to use backend proxy endpoints
// This simplifies key management and ensures consistent model usage.

import { api } from './api';
import type { ReplicateQuality } from '../types/replicate';

export class ReplicateService {
  private apiKey: string;
  private onProgress?: (progress: number) => void;

  constructor(apiKey: string, onProgress?: (progress: number) => void) {
    this.apiKey = apiKey;
    this.onProgress = onProgress;
  }

  private async callEndpoint(endpoint: string, body: Record<string, any>): Promise<string> {
    try {
      // Simulate starting progress
      this.onProgress?.(10);

      // Pass the API key if we have one, otherwise backend uses fallback
      const payload = { ...body, replicateKey: this.apiKey };

      const response = await api.post<{ url: string; error?: string }>(`/api/replicate/${endpoint}`, payload);

      this.onProgress?.(50); // Processing...

      if (response.error) {
        throw new Error(response.error);
      }

      this.onProgress?.(100);
      return response.url;
    } catch (error) {
      this.onProgress?.(0);
      console.error(`[ReplicateService] ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Enhance faces in an image (GFPGAN)
   */
  async faceEnhance(image: string): Promise<string> {
    return this.callEndpoint('face-enhance', { image });
  }

  /**
   * Remove background from an image (RMBG-2.0)
   */
  async removeBg(image: string): Promise<string> {
    return this.callEndpoint('remove-background', { image });
  }

  /**
   * Inpaint an image (Stable Diffusion Inpainting)
   */
  async inpaint(image: string, mask: string, prompt: string, negativePrompt?: string): Promise<string> {
    return this.callEndpoint('inpaint', {
      image,
      mask,
      prompt,
      negative_prompt: negativePrompt
    });
  }

  /**
   * Enhance quality / Upscale (Real-ESRGAN/Upscale)
   */
  async upscale(image: string, quality: ReplicateQuality = 'balanced', faceEnhance: boolean = false): Promise<string> {
    return this.callEndpoint('upscale', {
      image,
      scale: 2, // Standard 2x for quality enhancement
      face_enhance: faceEnhance
    });
  }

  /**
   * Restore low-quality image (CodeFormer/Real-ESRGAN)
   */
  async restore(image: string): Promise<string> {
    return this.callEndpoint('restore', { image });
  }

  /**
   * Magic Edit (InstructPix2Pix)
   */
  async magicEdit(image: string, prompt: string, strength: number = 0.8): Promise<string> {
    return this.callEndpoint('magic-edit', { image, prompt, strength });
  }

  /**
   * Generate Layer (SDXL)
   */
  async generateLayer(prompt: string, width?: number, height?: number): Promise<string> {
    return this.callEndpoint('generate-layer', { prompt, width, height });
  }

  /**
   * Outpaint an image (expand canvas and fill with AI-generated content)
   * Uses inpainting with a mask to extend the image in the specified direction
   */
  async outpaint(image: string, prompt: string, direction: 'left' | 'right' | 'up' | 'down' | 'all' = 'all'): Promise<string> {
    return this.callEndpoint('outpaint', {
      image,
      prompt,
      direction,
    });
  }
}

// Helper function to get Replicate service instance
export const getReplicateService = async (onProgress?: (progress: number) => void): Promise<ReplicateService> => {
  // Import here to avoid circular dependency
  const { getUserAPIKeys } = await import('./apiKeyStorage');
  const keys = await getUserAPIKeys();
  const apiKey = keys.replicate_api_key || '';
  return new ReplicateService(apiKey, onProgress);
};
