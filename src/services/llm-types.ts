export type OpenRouterContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type ChatMessage = {
  role: string;
  content: string | OpenRouterContentItem[];
};

export const PROFILE_ZONE_CONSTRAINT =
  ' IMPORTANT CONSTRAINT: Do NOT place any text, logos, or important visual elements in the bottom-left corner area (coordinates 0,0 to 568,264).';

export interface PromptEnhanceContext {
  industry?: string; // e.g., "tech", "finance", "healthcare"
  style?: string; // e.g., "professional", "creative", "minimal"
  brandColors?: string[]; // e.g., ["#1a73e8", "#34a853"]
  targetModel?: 'imagen-3' | 'flux' | 'ideogram' | 'sd3' | 'kling' | 'luma';
  platformFormat?: string; // e.g., "Instagram Story (9:16)"
}

export type CanvasDimensions = {
  width: number;
  height: number;
} | null;
