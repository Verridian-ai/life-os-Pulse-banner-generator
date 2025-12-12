// Replicate API TypeScript interfaces

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string | string[] | null;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

export interface ReplicateStartRequest {
  version: string;
  input: Record<string, unknown>;
  webhook?: string;
  webhook_events_filter?: ('start' | 'output' | 'logs' | 'completed')[];
}

export interface ReplicateUpscaleInput {
  image: string; // URL or base64
  scale?: number; // 2 or 4
  face_enhance?: boolean; // For Real-ESRGAN
}

export interface ReplicateRemoveBgInput {
  image: string; // URL or base64
}

export interface ReplicateInpaintInput {
  image: string; // URL or base64
  prompt: string;
  mask?: string; // Mask image URL or base64
  guidance_scale?: number;
  num_inference_steps?: number;
  strength?: number;
}

export interface ReplicateOutpaintInput {
  image: string; // URL or base64
  prompt: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  pixels?: number; // How many pixels to extend
}

export interface ReplicateRestoreInput {
  img: string; // URL or base64
  version?: string;
  scale?: number;
}

export interface ReplicateFaceEnhanceInput {
  img: string; // URL or base64
  version?: string;
  scale?: number;
}

export interface ReplicateModelVersions {
  // Upscaling
  upscale: {
    fast: string; // nightmareai/real-esrgan
    balanced: string; // philz1337x/recraft-clarity-upscaler
    best: string; // batouresearch/magic-image-refiner
  };
  // Background removal
  removebg: string; // cjwbw/rembg
  // Inpainting
  inpaint: {
    flux: string; // black-forest-labs/flux-fill-pro
    ideogram: string; // ideogram-ai/ideogram-v3-inpainting
  };
  // Outpainting
  outpaint: string; // stability-ai/stable-diffusion-outpainting
  // Restoration
  restore: string; // sczhou/codeformer
  // Face enhancement
  faceenhance: string; // tencentarc/gfpgan
}

export type ReplicateQuality = 'fast' | 'balanced' | 'best';

export interface ReplicateProgress {
  percentage: number; // 0-100
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  message?: string;
}

export class ReplicateError extends Error {
  constructor(
    message: string,
    public predictionId?: string,
    public status?: string,
    public detail?: unknown
  ) {
    super(message);
    this.name = 'ReplicateError';
  }
}
