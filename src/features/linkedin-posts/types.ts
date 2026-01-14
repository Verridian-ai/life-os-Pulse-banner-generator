/**
 * LinkedIn Content Studio Types
 *
 * Defined according to the social_and_networking_architecture KI standards (Jan 2026).
 */

export type PostTemplate =
  | 'story'
  | 'educational'
  | 'listicle'
  | 'contrarian'
  | 'video'
  | 'job_update';

export type EmotionalTone =
  | 'educational'
  | 'inspirational'
  | 'bold'
  | 'minimalist'
  | 'dramatic'
  | 'professional';

export interface CopywritingRequest {
  topic: string;
  template: PostTemplate;
  tone: EmotionalTone;
  targetAudience?: string;
  keyPoints?: string[];
  includeHashtags?: boolean;
}

export interface ViralScore {
  overall: number; // 0-100
  hook: number;
  readability: number;
  engagement: number;
  virality: number;
}

export interface HashtagSuggestion {
  tag: string;
  reach: 'high' | 'medium' | 'niche';
}

export interface CopywritingResult {
  content: string;
  alternativeHooks: string[];
  hashtagSuggestions: HashtagSuggestion[];
  viralScore: ViralScore;
}

export interface LinkedInImageGeneratorProps {
  topic: string;
  isLoading: boolean;
  onGenerate: (request: ImageGenerationRequest) => void;
}

export interface ImageGenerationRequest {
  prompt: string;
  dimensions: { width: number; height: number };
  style: 'professional' | 'creative' | 'bold' | 'minimalist';
}
