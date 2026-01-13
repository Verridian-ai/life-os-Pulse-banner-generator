// X (Twitter) Studio Types

export interface XContent {
  id: string;
  userId: string;
  contentType: XContentType;
  tweets: ThreadTweet[];
  media: MediaAttachment[];
  poll?: PollConfig;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type XContentType = 'tweet' | 'thread' | 'quote' | 'reply';
export type ContentStatus = 'draft' | 'scheduled' | 'published';

export interface ThreadTweet {
  id: string;
  content: string;
  charCount: number;
  media?: MediaAttachment;
  order: number;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'gif' | 'video';
  url: string;
  altText?: string;
}

export interface PollConfig {
  question: string;
  options: string[]; // 2-4 options
  duration: PollDuration;
}

export type PollDuration = '5m' | '1h' | '6h' | '12h' | '1d' | '3d' | '7d';

export interface EngagementScore {
  overall: number;
  retweets: number;
  likes: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  factors: EngagementFactor[];
  bestTimes: TimeSlot[];
  viralPotential: number;
}

export interface EngagementFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

export interface TimeSlot {
  day: number; // 0-6
  hour: number; // 0-23
  score: number;
  timezone: string;
}

export interface Trend {
  name: string;
  tweetCount: number;
  category: string;
  isHashtag: boolean;
  location?: string;
}

export type NumberingStyle =
  | 'none'
  | 'simple' // 1/
  | 'total' // 1/10
  | 'emoji' // 🧵1/
  | 'custom';

export interface ThreadAnalysis {
  tweetCount: number;
  totalChars: number;
  hasHook: boolean;
  hasCTA: boolean;
  hasVisualBreaks: boolean;
  readingTime: number;
  suggestions: string[];
}

export interface TweetOptimization {
  charCount: number;
  charLimit: number;
  hasHashtag: boolean;
  hasMention: boolean;
  hasLink: boolean;
  linkShortenedLength: number;
  suggestions: string[];
}

export interface QuoteTweetSuggestion {
  id: string;
  content: string;
  angle: QuoteAngle;
  predictedEngagement: number;
}

export type QuoteAngle =
  | 'agree'
  | 'disagree'
  | 'add_context'
  | 'ask_question'
  | 'humor'
  | 'summarize';

export interface XFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  contentType: 'header' | 'profile' | 'tweet';
}

export interface HeaderSafeZone {
  textSafe: { x: number; y: number; width: number; height: number };
  profileOverlap: { x: number; y: number; radius: number };
}
