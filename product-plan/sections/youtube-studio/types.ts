// YouTube Studio Types

export interface YouTubeContent {
  id: string;
  userId: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  ctrScore: CTRScore;
  videoId?: string;
  scheduledAt?: Date;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentStatus = 'draft' | 'ready' | 'published';

export interface CTRScore {
  overall: number; // 0-10%
  factors: CTRFactor[];
  suggestions: string[];
  competitorComparison?: CompetitorAnalysis[];
}

export interface CTRFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface CompetitorAnalysis {
  channelName: string;
  thumbnailUrl: string;
  ctrEstimate: number;
  strengths: string[];
}

export interface ThumbnailFormat {
  width: 1280;
  height: 720;
  aspectRatio: '16:9';
}

export interface ThumbnailAnalysis {
  faceDetected: boolean;
  facePosition?: { x: number; y: number };
  textReadability: number;
  colorContrast: number;
  emotionScore: number;
  brandConsistency: number;
}

export interface TitleOptimization {
  length: number;
  optimalLength: number;
  hasNumber: boolean;
  hasPowerWord: boolean;
  curiosityGap: number;
  keywordPlacement: 'front' | 'middle' | 'end' | 'none';
  suggestions: string[];
}

export interface DescriptionOptimization {
  length: number;
  hasTimestamps: boolean;
  hasLinks: boolean;
  hasCTA: boolean;
  keywordDensity: number;
  suggestions: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  relevance: number;
  trending: boolean;
}

export interface ChannelConsistency {
  colorMatch: number;
  fontMatch: number;
  styleMatch: number;
  seriesTemplates: SeriesTemplate[];
}

export interface SeriesTemplate {
  id: string;
  name: string;
  thumbnailUrl: string;
  usageCount: number;
}
