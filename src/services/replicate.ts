// Replicate API Service - Complete implementation for all image processing operations

import type { ReplicatePrediction, ReplicateQuality } from '../types/replicate';
import { MODELS } from '../constants';

export class ReplicateError extends Error {
  constructor(
    message: string,
    public predictionId?: string,
    public status?: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = 'ReplicateError';
  }
}

export class ReplicateService {
  private apiKey: string;
  private onProgress?: (progress: number) => void;
  private baseUrl = '/api/replicate/v1';

  constructor(apiKey: string, onProgress?: (progress: number) => void) {
    this.apiKey = apiKey;
    this.onProgress = onProgress;
  }

  /**
   * Start a new Replicate prediction
   */
  private async startPrediction(version: string, input: Record<string, unknown>): Promise<string> {
    if (!this.apiKey) {
      throw new ReplicateError('Replicate API key not found. Please add it in Settings.');
    }

    console.log('[Replicate] Starting prediction with version:', version);
    console.log('[Replicate] API Key present:', !!this.apiKey);
    console.log('[Replicate] API Key length:', this.apiKey?.length);

    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'X-Replicate-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version, input }),
    });

    console.log('[Replicate] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ReplicateError(
        `Replicate API Error: ${error.detail || response.statusText}`,
        undefined,
        response.status.toString(),
        error,
      );
    }

    const data: ReplicatePrediction = await response.json();
    return data.id;
  }

  /**
   * Poll a prediction until it completes
   */
  private async pollPrediction(predictionId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max (1s polling interval)

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'X-Replicate-Token': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ReplicateError(
          `Failed to fetch prediction: ${error.detail || response.statusText}`,
          predictionId,
        );
      }

      const prediction: ReplicatePrediction = await response.json();

      // Update progress callback
      if (this.onProgress) {
        const progress =
          prediction.status === 'starting'
            ? 10
            : prediction.status === 'processing'
              ? 50
              : prediction.status === 'succeeded'
                ? 100
                : 0;
        this.onProgress(progress);
      }

      // Check if completed
      if (prediction.status === 'succeeded') {
        // Extract output (can be string or array)
        const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

        if (!output) {
          throw new ReplicateError('Prediction succeeded but no output returned', predictionId);
        }

        return output;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new ReplicateError(
          `Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`,
          predictionId,
          prediction.status,
        );
      }

      // Wait before next poll
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }

    throw new ReplicateError('Prediction timeout after 5 minutes', predictionId, 'timeout');
  }

  /**
   * Upscale an image 2x with quality selector
   */
  async upscale(imageUrl: string, quality: ReplicateQuality = 'balanced'): Promise<string> {
    const version = MODELS.replicate.upscale[quality];
    const input: Record<string, unknown> = {
      image: imageUrl,
      scale: 2,
    };

    // Real-ESRGAN supports face enhancement
    if (quality === 'fast') {
      input.face_enhance = false; // Can be enabled if needed
    }

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Remove background from an image
   */
  async removeBg(imageUrl: string): Promise<string> {
    const version = MODELS.replicate.removebg;
    const input = {
      image: imageUrl,
    };

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Inpaint an image (fill masked area with AI-generated content)
   */
  async inpaint(
    imageUrl: string,
    prompt: string,
    mask?: string,
    model: 'flux' | 'ideogram' = 'flux',
  ): Promise<string> {
    const version = MODELS.replicate.inpaint[model];
    const input: Record<string, unknown> = {
      image: imageUrl,
      prompt,
    };

    if (mask) {
      input.mask = mask;
    }

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Outpaint an image (extend beyond borders)
   */
  async outpaint(
    imageUrl: string,
    prompt: string,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
  ): Promise<string> {
    const version = MODELS.replicate.outpaint;
    const input = {
      image: imageUrl,
      prompt,
      direction,
    };

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Restore a low-quality or blurry image
   */
  async restore(imageUrl: string): Promise<string> {
    const version = MODELS.replicate.restore;
    const input = {
      img: imageUrl, // Note: CodeFormer uses 'img' not 'image'
      version: '1.3',
      scale: 2,
    };

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Enhance faces in an image
   */
  async faceEnhance(imageUrl: string): Promise<string> {
    const version = MODELS.replicate.faceenhance;
    const input = {
      img: imageUrl, // Note: GFPGAN uses 'img' not 'image'
      version: '1.3',
      scale: 2,
    };

    const predictionId = await this.startPrediction(version, input);
    return await this.pollPrediction(predictionId);
  }

  /**
   * Cancel a running prediction
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/predictions/${predictionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to cancel prediction:', predictionId);
    }
  }

  /**
   * Get prediction status without polling
   */
  async getPredictionStatus(predictionId: string): Promise<ReplicatePrediction> {
    const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ReplicateError('Failed to fetch prediction status', predictionId);
    }

    return await response.json();
  }
}

// Helper function to get Replicate service instance
export const getReplicateService = (onProgress?: (progress: number) => void): ReplicateService => {
  const apiKey =
    localStorage.getItem('replicate_api_key') || import.meta.env.VITE_REPLICATE_API_KEY || '';
  return new ReplicateService(apiKey, onProgress);
};
