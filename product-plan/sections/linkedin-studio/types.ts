// LinkedIn Content Studio Types

export interface LinkedInPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  hashtags: string[];
  viralScore: ViralScore;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PostStatus;
  metrics?: PostMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ViralScore {
  overall: number; // 0-100
  factors: ScoreFactor[];
  suggestions: string[];
}

export interface ScoreFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface PostMetrics {
  impressions: number;
  likes: number;
  comments: number;
  reposts: number;
  clicks: number;
  engagementRate: number;
}

export interface LinkedInAccount {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  type: 'personal' | 'company';
  connected: boolean;
  accessToken?: string;
  expiresAt?: Date;
}

export interface CopywritingSuggestion {
  id: string;
  type: 'hook' | 'body' | 'cta' | 'hashtag';
  original: string;
  suggestion: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export type ToneOption =
  | 'professional'
  | 'casual'
  | 'inspiring'
  | 'educational'
  | 'humorous'
  | 'storytelling';

export interface ContentGenerationRequest {
  topic: string;
  tone: ToneOption;
  length: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
  includeEmojis: boolean;
  brandVoice?: string;
}

export interface LinkedInStudioState {
  post: LinkedInPost | null;
  selectedAccount: LinkedInAccount | null;
  suggestions: CopywritingSuggestion[];
  isGenerating: boolean;
  isPublishing: boolean;
  error: string | null;
}
