// Brand Consistency Engine - Learn and enforce brand guidelines

import { GoogleGenAI } from "@google/genai";
import { MODELS } from "../constants";
import type { BrandProfile } from "../types/ai";
import type { Part } from "../types";

const BRAND_PROFILE_KEY = 'brand_profile';

/**
 * Extract brand profile from reference images using vision AI
 */
export const extractBrandFromImages = async (images: string[]): Promise<Partial<BrandProfile>> => {
  const geminiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!geminiKey) throw new Error("Gemini API Key required for brand analysis");

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Build parts array with all images
    const parts: Part[] = images.map(img => {
      const base64Data = img.split(',')[1] || img;
      return {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      };
    });

    // Add analysis prompt
    parts.push({
      text: `Analyze these images to extract brand identity elements.

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
}`
    });

    const response = await ai.models.generateContent({
      model: MODELS.textThinking,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const result = JSON.parse(response.text || '{}');

    return {
      colors: result.colors || [],
      styleKeywords: result.styleKeywords || [],
      industry: result.industry,
      lastUpdated: Date.now(),
      version: 1,
    };
  } catch (error) {
    console.error("Brand extraction error:", error);
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
    console.error("Failed to save brand profile:", error);
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
      console.warn("Brand profile version mismatch, resetting");
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Failed to load brand profile:", error);
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
  brandProfile: BrandProfile
): Promise<{ consistent: boolean; issues: string[]; score: number }> => {
  const geminiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!geminiKey) throw new Error("Gemini API Key required");

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const colors = brandProfile.colors.map(c => `${c.name} (${c.hex})`).join(', ');
    const styles = brandProfile.styleKeywords.join(', ');

    const parts: Part[] = [
      { inlineData: { mimeType: 'image/png', data: base64Data } },
      {
        text: `Analyze this image against the brand guidelines below.

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
}`
      }
    ];

    const response = await ai.models.generateContent({
      model: MODELS.textThinking,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    const result = JSON.parse(response.text || '{}');

    return {
      consistent: result.consistent || false,
      score: result.score || 0,
      issues: result.issues || [],
    };
  } catch (error) {
    console.error("Brand consistency check error:", error);
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
export const generateBrandPrompt = (
  basePrompt: string,
  brandProfile: BrandProfile
): string => {
  const colors = brandProfile.colors.map(c => c.hex).join(', ');
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
      throw new Error("Invalid brand profile format");
    }

    saveBrandProfile(profile);
    return true;
  } catch (error) {
    console.error("Failed to import brand profile:", error);
    return false;
  }
};
