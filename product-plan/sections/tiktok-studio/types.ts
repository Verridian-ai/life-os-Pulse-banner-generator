// TikTok Studio Types

export interface TikTokContent {
  id: string;
  userId: string;
  videoUrl?: string;
  coverUrl: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  soundId?: string;
  soundName?: string;
  viralScore: ViralScore;
  scheduledAt?: Date;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentStatus = 'draft' | 'ready' | 'published';

export interface ViralScore {
  overall: number; // 0-100
  fypPotential: number;
  factors: ViralFactor[];
  suggestions: string[];
  optimalPostTime: Date;
}

export interface ViralFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  usageCount: number;
  trend: TrendStatus;
  previewUrl: string;
  duration: number;
  category: string;
}

export type TrendStatus = 'rising' | 'peak' | 'declining' | 'stable';

export interface TrendingHashtag {
  tag: string;
  views: number;
  trend: TrendStatus;
  category: string;
  relatedTags: string[];
}

export interface Challenge {
  id: string;
  name: string;
  hashtag: string;
  description: string;
  participantCount: number;
  trend: TrendStatus;
  exampleVideos: string[];
}

export interface ContentIdea {
  id: string;
  title: string;
  format: TikTokFormat;
  hook: string;
  structure: string[];
  relatedTrend?: string;
  estimatedViews: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type TikTokFormat =
  | 'tutorial'
  | 'pov'
  | 'storytime'
  | 'transition'
  | 'duet'
  | 'stitch'
  | 'greenscreen'
  | 'challenge'
  | 'asmr'
  | 'comedy'
  | 'educational'
  | 'review';

export interface VideoFrame {
  timestamp: number;
  thumbnailUrl: string;
  isKeyFrame: boolean;
}

export interface TextOverlay {
  text: string;
  position: { x: number; y: number };
  style: TextStyle;
  animation?: TextAnimation;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  alignment: 'left' | 'center' | 'right';
}

export type TextAnimation =
  | 'none'
  | 'typewriter'
  | 'bounce'
  | 'slide_in'
  | 'fade_in'
  | 'pop';

export interface HookAnalysis {
  firstThreeSeconds: string;
  patternInterrupt: boolean;
  textHook: boolean;
  visualHook: boolean;
  soundSync: boolean;
  retentionPrediction: number;
  suggestions: string[];
}

export interface TikTokFormat {
  width: 1080;
  height: 1920;
  aspectRatio: '9:16';
}
