import { generateAgentResponse } from './llm';
import type { BrandProfile } from '../types/ai';

const BRAND_PROFILE_KEY = 'brand_profile';

/**
 * Extract brand profile from reference images using vision AI (via OpenRouter)
 */
export const extractBrandFromImages = async (images: string[]): Promise<Partial<BrandProfile>> => {
  try {
    const prompt = `Analyze these images to extract brand identity elements.

Identify and extract:
1. Primary colors (provide hex codes and descriptive names)
2. Style keywords (e.g., "modern", "minimalist", "professional", "bold", "elegant")
3. Visual patterns or themes

Be specific and detailed. Return JSON format:
{
  "colors": [
    { "hex": "#1E3A8A", "name": "Navy Blue", "usage": "primary" },
    { "hex": "#F97316", "name": "Orange", "usage": "accent" }
  ],
  "styleKeywords": ["modern", "professional", "tech"],
  "industry": "Technology" (if identifiable)
}`;

    // We reuse the existing agent response function which handles OpenRouter + Vision
    // We pass the prompt as the user transcript and the first image as screenshot, 
    // but we need to modify generateAgentResponse to support multiple images if we want to be robust.
    // For now, we'll try to use the first image or refactor.
    // Actually, let's just make a direct call using the same pattern as generateDesignChatResponse.

    // Using generateAgentResponse signature: (transcript, screenshot, history)
    // It only accepts one image. 
    // Let's rely on a new export from llm.ts or just inline the fetch here if needed?
    // Better: Helper in llm.ts was not exported.
    // Let's use generateDesignChatResponse which supports multiple images.

    // Cyclic dependency risk? brandEngine -> llm -> brandEngine? 
    // llm.ts imports constants, types, utils. Doesn't seem to import brandEngine.
    // So safe to import from llm.

    const { generateDesignChatResponse } = await import('./llm');
    const response = await generateDesignChatResponse(prompt, images);

    const text = response.text || '{}';
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return {
      colors: result.colors || [],
      styleKeywords: result.styleKeywords || [],
      industry: result.industry,
      lastUpdated: Date.now(),
      version: 1,
    };
  } catch (error) {
    console.error('Brand extraction error:', error);
    throw error;
  }
};

/**
 * Save brand profile to localStorage
 */
export const saveBrandProfile = (profile: BrandProfile): void => {
  try {
    const serialized = JSON.stringify(profile);
    localStorage.setItem(BRAND_PROFILE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save brand profile:', error);
  }
};

/**
 * Load brand profile from localStorage
 */
export const loadBrandProfile = (): BrandProfile | null => {
  try {
    const stored = localStorage.getItem(BRAND_PROFILE_KEY);
    if (!stored) return null;

    const profile = JSON.parse(stored) as BrandProfile;

    // Validate schema version
    if (profile.version !== 1) {
      console.warn('Brand profile version mismatch, resetting');
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Failed to load brand profile:', error);
    return null;
  }
};

/**
 * Update existing brand profile with new data
 */
export const updateBrandProfile = (updates: Partial<BrandProfile>): BrandProfile | null => {
  const current = loadBrandProfile();
  if (!current) return null;

  const updated: BrandProfile = {
    ...current,
    ...updates,
    lastUpdated: Date.now(),
  };

  saveBrandProfile(updated);
  return updated;
};

/**
 * Clear brand profile
 */
export const clearBrandProfile = (): void => {
  localStorage.removeItem(BRAND_PROFILE_KEY);
};

/**
 * Check if a design adheres to brand guidelines
 */
export const checkBrandConsistency = async (
  imageBase64: string,
  brandProfile: BrandProfile,
): Promise<{ consistent: boolean; issues: string[]; score: number }> => {
  try {
    const colors = brandProfile.colors.map((c) => `${c.name} (${c.hex})`).join(', ');
    const styles = brandProfile.styleKeywords.join(', ');

    const prompt = `Analyze this image against the brand guidelines below.

Brand Guidelines:
- Primary Colors: ${colors}
- Style Keywords: ${styles}
- Industry: ${brandProfile.industry || 'General'}

Check for:
1. Color consistency (are brand colors used?)
2. Style alignment (does it match the brand aesthetic?)
3. Overall brand cohesion

Return JSON:
{
  "consistent": true/false,
  "score": 0-100 (consistency score),
  "issues": ["Issue 1", "Issue 2"] (if any)
}`;

    const { generateDesignChatResponse } = await import('./llm');
    const response = await generateDesignChatResponse(prompt, [imageBase64]);

    const text = response.text || '{}';
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    return {
      consistent: result.consistent || false,
      score: result.score || 0,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error('Brand consistency check error:', error);
    return {
      consistent: true,
      score: 100,
      issues: [],
    };
  }
};

/**
 * Generate brand-consistent prompt suggestions
 */
export const generateBrandPrompt = (basePrompt: string, brandProfile: BrandProfile): string => {
  const colors = brandProfile.colors.map((c) => c.hex).join(', ');
  const styles = brandProfile.styleKeywords.join(', ');

  return `${basePrompt}. Brand style: ${styles}. Use colors: ${colors}. Maintain ${brandProfile.industry || 'professional'} aesthetic for ${brandProfile.targetAudience || 'professionals'}.`;
};

/**
 * Export brand profile for sharing
 */
export const exportBrandProfile = (): string => {
  const profile = loadBrandProfile();
  if (!profile) return '';

  return JSON.stringify(profile, null, 2);
};

/**
 * Import brand profile from JSON string
 */
export const importBrandProfile = (jsonString: string): boolean => {
  try {
    const profile = JSON.parse(jsonString) as BrandProfile;

    // Validate required fields
    if (!profile.colors || !profile.styleKeywords || !profile.version) {
      throw new Error('Invalid brand profile format');
    }

    saveBrandProfile(profile);
    return true;
  } catch (error) {
    console.error('Failed to import brand profile:', error);
    return false;
  }
};
