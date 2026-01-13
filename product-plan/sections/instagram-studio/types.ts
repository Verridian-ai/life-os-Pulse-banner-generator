// Instagram Studio Types

export interface InstagramContent {
  id: string;
  userId: string;
  contentType: InstagramContentType;
  mediaUrls: string[];
  caption: string;
  hashtags: string[];
  mentions: string[];
  location?: string;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type InstagramContentType = 'post' | 'story' | 'reel' | 'carousel';
export type ContentStatus = 'draft' | 'scheduled' | 'published';

export interface EngagementScore {
  overall: number; // percentage
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  factors: EngagementFactor[];
  bestTimeToPost: Date;
  suggestions: string[];
}

export interface EngagementFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  order: number;
  altText?: string;
  textOverlay?: string;
}

export interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  category: HashtagCategory;
  avgReach?: number;
  lastUsed?: Date;
}

export type HashtagCategory = 'niche' | 'broad' | 'trending' | 'branded' | 'community';

export interface HashtagAnalysis {
  hashtag: string;
  postCount: number;
  reach: 'low' | 'medium' | 'high';
  competition: 'low' | 'medium' | 'high';
  banned: boolean;
  trending: boolean;
}

export interface CaptionAnalysis {
  length: number;
  hasHook: boolean;
  hasCTA: boolean;
  emojiCount: number;
  lineBreaks: number;
  mentionCount: number;
  suggestions: string[];
}

export interface GridPost {
  id: string;
  imageUrl: string;
  dominantColor: string;
  position: number;
  publishedAt?: Date;
}

export interface GridAnalysis {
  colorHarmony: number;
  visualFlow: number;
  themeConsistency: number;
  suggestions: string[];
}

export interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  elements: StoryElement[];
}

export interface StoryElement {
  type: 'text' | 'sticker' | 'poll' | 'question' | 'countdown' | 'link';
  position: { x: number; y: number };
  properties: Record<string, unknown>;
}

export interface InstagramFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  contentType: InstagramContentType;
}
